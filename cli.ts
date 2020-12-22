#!/usr/bin/env node
import yargs from 'yargs';
import { proccessFromConfigFile } from './index';
import { isFileExist } from './src/utils/file';
import fs from 'fs';
import { exit } from 'process';

const argv = yargs(process.argv.slice(2)).options({
  r: { type: 'boolean', default: false },
  g: { type: 'boolean', default: false },
}).argv;

// console.log(`--> ${process.argv.slice(2)}`);
// console.log(`--> ${JSON.stringify(argv)}`);

let arrayResult: any[] = [];
if (argv.t) {
  if (isFileExist(argv.t as string)) {
    proccessFromConfigFile(argv.t as string).then(result => {
      arrayResult.push(result);
    }).catch(error => {
      console.log(`proccessFromConfigFile argv returns error ${error.stack}`);
    });
  } else {
    console.error(`File not found!`);
    exit(2);
  }
} else {
  if (argv.g) {
    const path = require('path');
    fs.copyFileSync(path.resolve(__dirname, 'config.example.json'), './config.example.json');
  } else {
    const homedir = require('os').homedir();

    proccessFromConfigFile(homedir + '/.tnc-cup.config.json').then(result => {
      arrayResult.push(result);
    }).catch(error => {
      console.log(`proccessFromConfigFile .tnc-cup.config.json returns error ${error.stack}`);
    });

  }
}