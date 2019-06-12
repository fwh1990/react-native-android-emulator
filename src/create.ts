import fs from 'fs';
import path from 'path';
import { createPromptModule } from 'inquirer';
import { execSync } from 'child_process';

let rnVersion: string;
const rnPackage = path.resolve('node_modules/react-native/package.json');

if (fs.existsSync(rnPackage)) {
  const { version } = require(rnPackage) as { version: string };

  rnVersion = version.split('.', 2).join('.');
}

const CANCEL_CREATE_TOKEN = 'Cancel now.';

interface RnMeta {
  name: string;
  package: string;
}

const RN_METAS: Array<RnMeta> = [
  {
    name: '0.60',
    package: 'system-images;android-28;google_apis;x86_64',
  },
  {
    name: '0.59',
    package: 'system-images;android-28;google_apis;x86_64',
  },
  {
    name: '0.58',
    package: 'system-images;android-28;google_apis;x86_64',
  },
  {
    name: '0.56',
    package: 'system-images;android-26;google_apis;x86_64',
  },
  {
    name: '0.55',
    package: 'system-images;android-23;google_apis;x86_64',
  },
  {
    name: 'Cancel and go back',
    package: CANCEL_CREATE_TOKEN,
  },
];

const create = (meta: RnMeta) => {
  const emulatorName = 'android-rn-' + meta.name;

  console.log('\nDownloading sdk...\n');
  execSync(`sdkmanager "${meta.package}" --no_https --channel=0`, {
    stdio: 'inherit',
  });
  console.log('\nDone\n');

  console.log('\nCreating emulator...\n');
  execSync(`avdmanager create avd --force --name ${emulatorName} --package "${meta.package}" --sdcard 300M --device "Nexus 5X"`, {
    stdio: 'inherit',
  });
  console.log('\nDone\n');


  console.log('\nModify ini file...\n');
  const iniFile = path.join(__dirname, 'config.ini');
  execSync(`cat ${iniFile} >> ~/.android/avd/${emulatorName}.avd/config.ini`, {
    stdio: 'inherit',
  });
  console.log('\nDone\n');

  return emulatorName;
};

export const createEmulator = async () => {
  if (rnVersion) {
    const meta = RN_METAS.find((item) => item.name === rnVersion);

    if (meta) {
      return create(meta);
    }
  }

  const { data } = await createPromptModule()<{ data: RnMeta }>({
    name: 'data',
    message: 'What\'s your current react-native version?',
    prefix: '',
    suffix: '',
    type: 'list',
    choices: RN_METAS.map((item) => ({
      name: item.name,
      value: item,
    })),
  });

  if (data.package === CANCEL_CREATE_TOKEN) {
    return;
  }

  return create(data);
};
