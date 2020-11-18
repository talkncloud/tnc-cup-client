#!/usr/bin/env node
import yargs from 'yargs';
import { proccessFromConfigFile} from './index';
import fs from 'fs';

const argv = yargs(process.argv.slice(2)).options({
  r: { type: 'boolean', default: false },
  g: { type: 'boolean', default: false},
}).argv;

let arrayResult: any[] = [];
if (argv._[0]) {
  proccessFromConfigFile(argv._[0]).then(result => {
    arrayResult.push(result);
  }).catch(error => {
    console.log(`proccessFromConfigFile argv returns error ${error.stack}`);
  });
  console.log('OK');
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
  // if (argv.r) {
  //   arrayResult = proccessDirectory(argv._[0], [argv._[1]]);
  // } else {
  //   try {
  //       arrayResult = proccess(argv._[0], [argv._[1]]).data;
  //   } catch (e) {
  //       console.log(e.message);
  //   }
  // }
}