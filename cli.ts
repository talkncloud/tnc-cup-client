#!/usr/bin/env node
import yargs from 'yargs';
import { proccessFromConfigFile } from './index';
import { isFileExist } from './src/utils/file';
import { terminateApp } from './src/utils/app';
import { TERMINATE_ON_ERROR } from './src/utils/constants';
import fs from 'fs';

const argv = yargs(process.argv.slice(2)).options({
  r: { type: 'boolean', default: false },
  g: { type: 'boolean', default: false },
}).argv;

// console.log(`--> ${process.argv.slice(2)}`);
// console.log(`--> ${JSON.stringify(argv)}`);

if (process.argv.length <= 2) {
  console.error(`usage: [-t template.json] [-c to generate config]`);
  terminateApp(TERMINATE_ON_ERROR);
}

let arrayResult: any[] = [];
let shouldShowJson = false;
let shouldOutputToFile = false;

if (argv.t) {
  if (isFileExist(argv.t as string)) {
    if (argv.j) {
      shouldShowJson = true;
    }

    if (argv.o) {
      shouldOutputToFile = true;
    }

    proccessFromConfigFile(argv.t as string, shouldShowJson, shouldOutputToFile).then(result => {
      arrayResult.push(result);
    }).catch(error => {
      console.log(`proccessFromConfigFile argv returns error ${error.stack}`);
    });
  } else {
    console.error(`File not found!`);
    terminateApp(TERMINATE_ON_ERROR);
  }
} else {
  const homedir = require('os').homedir();

  if (argv.c) {
    const path = require('path');
    fs.copyFileSync(path.resolve(__dirname, '../config.example.json'), homedir + '/.tnc-cup.config.example.json');
  } else {
    if (argv.j) {
      shouldShowJson = true;
    }
    proccessFromConfigFile(homedir + '/.tnc-cup.config.json', shouldShowJson, shouldOutputToFile).then(result => {
      arrayResult.push(result);
    }).catch(error => {
      console.log(`proccessFromConfigFile .tnc-cup.config.json returns error ${error.stack}`);
    });

  }
}