#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const index_1 = require("./index");
const fs_1 = __importDefault(require("fs"));
const argv = yargs_1.default(process.argv.slice(2)).options({
    r: { type: 'boolean', default: false },
    g: { type: 'boolean', default: false },
}).argv;
let arrayResult = [];
if (argv._[0]) {
    arrayResult = index_1.proccessFromConfigFile(argv._[0]);
    console.log('OK');
}
else {
    if (argv.g) {
        const path = require('path');
        fs_1.default.copyFileSync(path.resolve(__dirname, 'config.example.json'), './config.example.json');
    }
    else {
        const homedir = require('os').homedir();
        arrayResult = index_1.proccessFromConfigFile(homedir + '/.tnc-cup.config.json');
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
