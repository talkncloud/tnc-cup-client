import fs from 'fs';
import path from 'path';

const isFileExist = (path: string) => {
  return fs.existsSync(path);
};

const constructOutputFileInfo = (fullPath: string) => {
  const fileName = getFileNameFromFullPath(fullPath);
  const newFileName = `${fileName.split('.')[0]}.tcup.txt`;
  const filePath = path.dirname(fullPath);
  return `${filePath}/${newFileName}`;
}

const getFileNameFromFullPath = (fullPath: string) => {
  return fullPath.replace(/^.*[\\\/]/, '');
}

export { isFileExist, constructOutputFileInfo, getFileNameFromFullPath }