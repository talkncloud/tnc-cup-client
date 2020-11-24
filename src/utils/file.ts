import fs from 'fs';

const isFileExist = (path: string) => {
  return fs.existsSync(path);
};

export { isFileExist }