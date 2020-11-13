import yaml from 'js-yaml';
import fs from 'fs';
import Axios from 'axios';

export function yamlParser(path: string) {
    try{
        const content = yaml.load(fs.readFileSync(path).toString());
        return content;    
    } catch(e) {
        console.log(e);
        return e;
    }
}

export function find(searchContent: any[], content: any, excludeSearchContent?: any[]) {
    let arrayFindResult = [];
    for(let key of Object.keys(content['Resources'])) {
        if(excludeSearchContent !== undefined 
            && excludeSearchContent.length > 0 
            && excludeSearchContent.includes(content['Resources'][key]['Type'])) {
            continue;
        }

        if(searchContent === undefined
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

interface Response { 
    data: any[], message: string;
}

export function proccess(
    cloudFormationFilePath: string, 
    searchContent: any[], 
    excludeSearchContent?: any[]
) {
    let response: Response = {
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
    } catch (e) {
        console.log(e);
        response.message = "Not valid json or yaml file"
        throw response;
    }
    return response;
}


export function proccessDirectory(
    cloudFormationDirPath: string, 
    searchContent: any[], 
    excludeSearchContent?: any[],
    additionalContentFromFilePath?: string
) {
    const path = require('path');
    const files = fs.readdirSync(cloudFormationDirPath);
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

export async function proccessFromConfigFile(path: string) {
    const config = yamlParser(path);
    if((config.files === undefined || config.files.length == 0) 
        && (config.directories === undefined || config.directories.length == 0)) {
        console.log("files or directories required");
        return [];
    }

    if(config.url === undefined && config.url == "") {
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
    try {
        const apiReturn = await Axios.post(
            config.url.url, 
            arrayResult.concat(config.other), 
            {
              headers: config.url.header
            }
          );
        console.log(apiReturn);
        return apiReturn;    
    } catch(e) {
        console.log(e.message);
        return e;
    }
}