
import fs from 'fs';
import Axios from 'axios';
import { Response } from './src/models/response';
import { parseYamlFromPath } from './src/utils/parser';

function find(content: any, includeSearchContent: any[], excludeSearchContent?: any[], availableServices?: any[]) {
    console.log(`find`);
    let arrayFindResult = [];
    for(let key of Object.keys(content['Resources'])) {
        const service = content['Resources'][key]['Type'];
        if(excludeSearchContent !== undefined 
            && excludeSearchContent.length > 0 
            && excludeSearchContent.includes(service)) {
            continue;
        }

        if (availableServices === undefined || availableServices === null) {
            continue;
        } else {
            if(availableServices.includes(service) &&
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

function proccessFile(
    cloudFormationFilePath: string, 
    includeSearchContent: any[], 
    excludeSearchContent?: any[],
    availableServices?: any[]
) {
    console.log(`proccess ${cloudFormationFilePath}`);
    let response: Response = {
        data: [],
        message: ""
    };
    try {
        const cloudFormationContent = parseYamlFromPath(cloudFormationFilePath);
        const findResult = find(cloudFormationContent, includeSearchContent, excludeSearchContent, availableServices);
        console.log(`Parse file: ${cloudFormationFilePath}`);
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

function proccessDirectory(
    cloudFormationDirPath: string, 
    includeSearchContent: any[], 
    excludeSearchContent?: any[],
    availableServices?: any[],
    additionalContentFromFilePath?: string
) {
    console.log(`proccessDirectory ${cloudFormationDirPath}`);
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

export async function proccessFromConfigFile(path: string) {
    console.log(`proccessFromConfigFile ${path}`);

    try {
        const config = parseYamlFromPath(path);

        if((config.files === undefined || config.files.length == 0) 
            && (config.directories === undefined || config.directories.length == 0)) {
            console.log("files or directories required");
            return [];
        }

        if(config.url === undefined && config.url == "") {
            console.log("url required");
            return [];
        }
        const baseUrl = `${config.api.baseUrl}/${config.api.version}`;
        const availableServices = await Axios.get(`${baseUrl}/${config.api.servicesEndpoint}`, {
            headers: config.api.header
          });
        const services: any[] = Object.keys(availableServices.data);
        console.log(`Available Services: ${JSON.stringify(services)}`);

        let arrayResult = [];
        for (let directory of config.directories) {
            arrayResult.push(...proccessDirectory(directory, config.find.include, config.find.exclude, services));
        }

        for (let file of config.files) {
            arrayResult.push(...proccessFile(file, config.find.include, config.find.exlude, services).data);
        }

        if (availableServices && availableServices.data) {
            console.log(`url: ${baseUrl}/${config.api.templateEndpoint}`);
            console.log(`header: ${JSON.stringify(config.api.header)}`);
            console.log(`data: ${JSON.stringify(arrayResult, null, 2)}`);
    
            const apiReturn = await Axios.post(
                `${baseUrl}/${config.api.templateEndpoint}`, 
                arrayResult, 
                {
                  headers: config.api.header
                }
              );
            
            console.log(apiReturn);
            return apiReturn;    
        } else {
            return [];
        }
        
    } catch(e) {
        console.log(JSON.stringify(e));
        return e;
    }
}