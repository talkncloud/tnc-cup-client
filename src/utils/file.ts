import fs from 'fs';
import path from 'path';
import { FileInfo } from '../models/file-info';

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

export { isFileExist, constructOutputFileInfo, getFileNameFromFullPath, readFileContent, constructFileInfo }