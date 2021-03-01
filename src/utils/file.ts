import fs from 'fs';
import path from 'path';
import { FileInfo } from '../models/file-info';
import { ServiceResponse } from '../models/service-response';
import { parseYamlFromPath, constructTemplateBodyApi } from './parser';
import { Response } from '../models/response';

const isFileExist = (path: string) => {
  return fs.existsSync(path);
};

const constructOutputFileInfo = (fullPath: string) => {
  const fileName = getFileNameFromFullPath(fullPath);
  const newFileName = `${fileName.split('.')[0]}.tcup.txt`;
  const filePath = path.dirname(fullPath);
  return `${filePath}/${newFileName}`;
}

const constructFileInfo = (originalFile: string, option: string, format: string) => {

  var fileName = path.parse(`${originalFile}`).base;
  var filePath = path.parse(`${originalFile}`).dir;
  var newFileName = `${fileName.split(`.${format}`)[0]}.${option}.${format}`;
  var fullPath = path.join(filePath, newFileName);

  var fileInfo: FileInfo = {
    baseFileName: fileName,
    fullPath,
    newFileName,
    filePath
  };

  return fileInfo;
}

const getFileNameFromFullPath = (fullPath: string) => {
  return fullPath.replace(/^.*[\\\/]/, '');
}

const readFileContent = (fullPath: string) => {
  return fs.readFileSync(fullPath, 'utf8').toString();
};

const find = (content: any, includeSearchContent: any[], excludeSearchContent?: any[], availableServices?: any[]) => {
  // console.log(`find content: ${JSON.stringify(content, null, 2)}`);
  // console.log(`find includeSearchContent: ${JSON.stringify(includeSearchContent)}`);
  // console.log(`find excludeSearchContent: ${JSON.stringify(excludeSearchContent)}`);
  // console.log(`find availableServices: ${JSON.stringify(availableServices)}`);
  let arrayFindResult = [];
  for (let key of Object.keys(content['Resources'])) {
    const service = content['Resources'][key]['Type'];
    // console.log(`find service: ${JSON.stringify(service, null, 2)}`);
    // console.log(`find service: ${JSON.stringify(service)}`);
    if (excludeSearchContent !== undefined
      && excludeSearchContent.length > 0
      && excludeSearchContent.includes(service)) {
      continue;
    }

    if (availableServices === undefined || availableServices === null) {
      continue;
    } else {
      if (availableServices.some((s: ServiceResponse) => s.cloudformation === service) &&
        (includeSearchContent === undefined
          || includeSearchContent.length == 0
          || (includeSearchContent !== undefined
            && includeSearchContent.length > 0
            && includeSearchContent.includes(service)))) {
        arrayFindResult.push({
          [key]: content['Resources'][key]
        });
      }
    }
  }
  return arrayFindResult;
}

const proccessFile = (
  cloudFormationFilePath: string,
  includeSearchContent: any[],
  excludeSearchContent?: any[],
  availableServices?: any[]
) => {
  // console.log(`proccess ${cloudFormationFilePath}`);
  let response: Response = {
    data: [],
    message: ""
  };
  try {
    const cloudFormationContent = parseYamlFromPath(cloudFormationFilePath);
    const findResult = find(cloudFormationContent, includeSearchContent, excludeSearchContent, availableServices);
    // console.log(`Parse file: ${cloudFormationFilePath}`);
    if (findResult.length > 0) {
      response.data.push(...findResult);
    }
  } catch (e) {
    console.log(`Process with error ${e.message}`);
    response.message = "Not valid json or yaml file"
    throw response;
  }
  return response;
}

const processFileForCalcs = (cloudFormationFilePath: string, availableServices: any[]) => {
  // console.log(`processFileForCalcs - filePath: ${cloudFormationFilePath}`);
  try {
    const cloudFormationContent = parseYamlFromPath(cloudFormationFilePath);
    let calcServices = [];
    for (let key of Object.keys(cloudFormationContent['Resources'])) {
      const service = cloudFormationContent['Resources'][key]['Type'];
      for (let i = 0; i <= availableServices.length; i++) {
        if (availableServices[i] !== undefined && service === availableServices[i].cloudformation) {
          calcServices.push(availableServices[i]);
          break;
        }
      }
    }
    // console.log(`eligible calc services: ${JSON.stringify(calcServices, null, 2)}`);
    return calcServices;
  } catch (e) {
    console.log(`processFileForCalcs: error: ${e.message}`);
    throw `Process with error ${e.message}`;
  }

}

const proccessDirectory = (
  cloudFormationDirPath: string,
  includeSearchContent: any[],
  excludeSearchContent?: any[],
  availableServices?: any[],
  additionalContentFromFilePath?: string
) => {
  // console.log(`proccessDirectory ${cloudFormationDirPath}`);
  const path = require('path');
  const files = fs.readdirSync(cloudFormationDirPath);
  const arrayDirectoryResult = [];
  for (let file of files) {
    try {
      const findResult = proccessFile(path.join(cloudFormationDirPath, file), includeSearchContent, excludeSearchContent, availableServices);
      arrayDirectoryResult.push(...findResult.data);
    }
    catch (e) {
      console.log(`Process Dir with error ${e.message}`);
    }
  }
  return arrayDirectoryResult;
}


export { 
  isFileExist, 
  constructOutputFileInfo, 
  getFileNameFromFullPath, 
  readFileContent, 
  constructFileInfo,
  proccessFile,
  proccessDirectory,
  processFileForCalcs
}