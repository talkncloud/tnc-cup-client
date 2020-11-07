"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proccessFromConfigFile = exports.proccessDirectory = exports.proccess = exports.find = exports.yamlParser = void 0;
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
function yamlParser(path) {
    try {
        const content = js_yaml_1.default.load(fs_1.default.readFileSync(path).toString());
        return content;
    }
    catch (e) {
        console.log(e);
        return e;
    }
}
exports.yamlParser = yamlParser;
function find(searchContent, content, excludeSearchContent) {
    let arrayFindResult = [];
    for (let key of Object.keys(content['Resources'])) {
        if (excludeSearchContent !== undefined
            && excludeSearchContent.length > 0
            && excludeSearchContent.includes(content['Resources'][key]['Type'])) {
            continue;
        }
        if (searchContent === undefined
            || searchContent.length == 0
            || (searchContent !== undefined
                && searchContent.length > 0
                && searchContent.includes(content['Resources'][key]['Type']))) {
            arrayFindResult.push({
                [key]: content['Resources'][key]
            });
        }
    }
    return arrayFindResult;
}
exports.find = find;
function proccess(cloudFormationFilePath, searchContent, excludeSearchContent, additionalContentFromFilePath) {
    let response = {
        data: [],
        message: ""
    };
    try {
        const cloudFormationContent = yamlParser(cloudFormationFilePath);
        const findResult = find(searchContent, cloudFormationContent, excludeSearchContent);
        console.log(`Parse file: ${cloudFormationFilePath}`);
        if (findResult.length > 0) {
            response.data.push(...findResult);
        }
    }
    catch (e) {
        console.log(e);
        response.message = "Not valid json or yaml file";
        throw response;
    }
    return response;
}
exports.proccess = proccess;
function proccessDirectory(cloudFormationDirPath, searchContent, excludeSearchContent, additionalContentFromFilePath) {
    const path = require('path');
    const files = fs_1.default.readdirSync(cloudFormationDirPath);
    const arrayDirectoryResult = [];
    for (let file of files) {
        try {
            const findResult = proccess(path.join(cloudFormationDirPath, file), searchContent, excludeSearchContent);
            arrayDirectoryResult.push(...findResult.data);
        }
        catch (e) {
            console.log(e.message);
        }
    }
    return arrayDirectoryResult;
}
exports.proccessDirectory = proccessDirectory;
function proccessFromConfigFile(path) {
    const config = yamlParser(path);
    if ((config.files === undefined || config.files.length == 0)
        && (config.directories === undefined || config.directories.length == 0)) {
        console.log("files or directories required");
        return [];
    }
    if (config.url === undefined && config.url == "") {
        console.log("url required");
        return [];
    }
    let arrayResult = [];
    for (let directory of config.directories) {
        arrayResult.push(...proccessDirectory(directory, config.find.include, config.find.exclude));
    }
    for (let file of config.files) {
        arrayResult.push(...proccess(file, config.find.include, config.find.exlude).data);
    }
    axios_1.default.post(config.url.url, arrayResult.concat(config.other), {
        headers: config.url.header
    }).then(response => console.log(`Success send to: ${response.config.url}`))
        .catch(e => console.log(e.message));
    return arrayResult;
}
exports.proccessFromConfigFile = proccessFromConfigFile;
