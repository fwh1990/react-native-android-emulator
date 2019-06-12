#!/usr/bin/env node

import { execSync } from 'child_process';
import { createPromptModule } from 'inquirer';
import { createEmulator } from './create';

const CREATE_NEW_ONE = {
  name: 'I want to create new emulator',
  value: (new Date()).toLocaleString(),
};

const launch = (name?: string) => {
  if (!name) {
    return init();
  }

  const processCount = execSync(`ps aux | grep "\\-avd ${name}" | wc -l`).toString();

  if (Number(processCount) >= 3) {
    console.log(`Android emulator ${name} had been launched`);
  } else {
    console.log(`Android emulator ${name} is launching now...`);
    execSync(`cd \$ANDROID_HOME/tools && emulator -avd ${name} &`, {
      stdio: 'inherit',
    });
  }
};

const init = () => {
  const avds = execSync('emulator -list-avds')
    .toString()
    .split('\n')
    .filter(Boolean);

  if (!avds.length) {
    createEmulator().then(launch);
  } else {
    createPromptModule()<{ avd: string }>({
      type: 'list',
      name: 'avd',
      message: 'Select an android emulator you want to launch:',
      choices: avds.map((avd) => ({
        name: avd,
        value: avd,
      })).concat([CREATE_NEW_ONE]),
      prefix: '',
      suffix: '',
    }).then(({ avd }) => {
      if (avd === CREATE_NEW_ONE.value) {
        createEmulator().then(launch);
      } else {
        launch(avd);
      }
    });
  }
};

init();
