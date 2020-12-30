import fs from 'fs';
import Axios from 'axios';
import { Response } from './src/models/response';
import { Service } from './src/models/service-content';
import { BudgetStatus } from './src/models/budget-status';
import { BudgetResponse } from './src/models/budget-response';
import { parseYamlFromPath, constructTemplateBodyApi } from './src/utils/parser';
import Table from "cli-table3"
import colors from "colors";
import { Currency } from './src/models/currency';
import { exit } from 'process';
const homedir = require('os').homedir();

function find(content: any, includeSearchContent: any[], excludeSearchContent?: any[], availableServices?: any[]) {
    console.log(`find`);
    let arrayFindResult = [];
    for (let key of Object.keys(content['Resources'])) {
        const service = content['Resources'][key]['Type'];
        if (excludeSearchContent !== undefined
            && excludeSearchContent.length > 0
            && excludeSearchContent.includes(service)) {
            continue;
        }

        if (availableServices === undefined || availableServices === null) {
            continue;
        } else {
            if (availableServices.includes(service) &&
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

export async function proccessFromConfigFile(filePath: string) {
    console.log(`proccessFromConfigFile ${filePath}`);
    try {
        const config = parseYamlFromPath(`${homedir}/.tnc-cup.config.json`);

        /*if((config.files === undefined || config.files.length == 0) 
            && (config.directories === undefined || config.directories.length == 0)) {
            console.log("files or directories required");
            return [];
        }*/

        if (config.url === undefined && config.url == "") {
            console.log("url required");
            return [];
        }
        const baseUrl = `${config.api.baseUrl}/${config.api.version}`;
        const availableServices = await Axios.get(`${baseUrl}/${config.api.servicesEndpoint}`, {
            headers: config.api.header
        });
        const services: any[] = Object.values(availableServices.data);
        // console.log(`Available Services: ${JSON.stringify(services)}`);

        let arrayResult = [];
        arrayResult.push(...proccessFile(filePath, config.find.include, config.find.exclude, services).data);
        /*for (let directory of config.directories) {
            arrayResult.push(...proccessDirectory(directory, config.find.include, config.find.exclude, services));
        }

        for (let file of config.files) {
            arrayResult.push(...proccessFile(file, config.find.include, config.find.exlude, services).data);
        }*/


        if (availableServices && availableServices.data) {
            const c: Currency = { code: `${config.currency}` };
            console.log(`url: ${baseUrl}/${config.api.templateEndpoint}`);
            // console.log(`header: ${JSON.stringify(config.api.header)}`);
            console.log(`body: ${constructTemplateBodyApi(arrayResult, c, config.budget, config.region)}`);
            // console.log(`data: ${JSON.stringify(arrayResult, null, 2)}`);

            const apiReturn = await Axios.post(
                `${baseUrl}/${config.api.templateEndpoint}`,
                constructTemplateBodyApi(arrayResult, c, config.budget, config.region),
                {
                    headers: config.api.header
                }
            );

            console.log(`returned data: ${JSON.stringify(apiReturn.data, null, 2)}`);

            const table = new Table({
                head: [colors.white("Service"), colors.white("Group"), colors.white("Description"), colors.white("Price")],
                colWidths: [15, 15, 90, 10],
                wordWrap: true,
                chars: {
                    'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                    , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                    , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                    , 'right': '║', 'right-mid': '╢', 'middle': '│'
                }
            })

            const a: any[] = [];
            let budgetResponse: BudgetResponse | null = null;
            apiReturn.data.forEach((e: any | Service) => {
                // console.log(`e --> ${JSON.stringify(e)}`);
                let group = '';
                let service = '';
                let description = '';
                let price = '';
                let isGroup = false;
                for (var item in e) {
                    // console.log(`Single Service: --> ${item}`);
                    for (var key in e[item]) {
                        // console.log(`key: --> ${key}`);
                        if (key.match(/description|price/)) {
                            service = item;
                            if (key === 'description') description = e[item][key];
                            if (key === 'price') price = e[item][key];
                            isGroup = false;
                        }
                        else {
                            isGroup = true;
                            continue;
                        }
                    }
                    if (!isGroup) {
                        // console.log(`push: --> ${group} ${service} ${description} ${price}`);
                        // Align description right if TOTAL
                        if (item.includes('TOTAL ')) {
                            table.push([colors.yellow(service), colors.yellow(group), { hAlign: 'right', content: colors.yellow(description) }, { hAlign: 'right', content: colors.yellow('$' + `${price}`) }]);
                        } else {
                            table.push([colors.green(service), colors.green(group), colors.green(description), { hAlign: 'right', content: colors.green('$' + `${price}`) }]);
                        }
                    } else {
                        group = item;
                        // console.log(`Group Service: --> ${item}`);

                        if (item.toLowerCase().includes('budget')) {
                            budgetResponse = e[item];
                        } else {
                            for (var subItem in e[item]) {
                                // console.log(`single service key: --> ${subItem}`);
                                service = subItem;
                                for (var key in e[item][subItem]) {
                                    // console.log(`subItem key key: --> ${key}`);
                                    if (key.match(/description|price/)) {
                                        if (key === 'description') description = e[item][subItem][key];
                                        if (key === 'price') price = e[item][subItem][key];
                                    }
                                }
                                // console.log(`push: --> ${group} ${service} ${description} ${price}`);
                                table.push([colors.green(service), colors.green(group), colors.green(description), { hAlign: 'right', content: colors.green('$' + `${price}`) }]);
                            }
                        }
                    }
                }

                a.push(e);
            });
            console.log(table.toString());

            if (budgetResponse !== null) {
                switch ((budgetResponse as BudgetResponse).status) {
                    case BudgetStatus.NORMAL:
                        console.log(`\n\x1b[32mBudget: ${(budgetResponse as BudgetResponse).message}`);
                        break;
                    case BudgetStatus.WARNING:
                        console.log(`\n\x1b[33mBudget: ${(budgetResponse as BudgetResponse).message}`);
                        break;
                    case BudgetStatus.ERROR:
                        console.log(`\n\x1b[31mBudget: ${(budgetResponse as BudgetResponse).message}`);
                        break;
                    default:
                        console.log(`\n\x1b[33mBudget: Unknown message.`);
                        break;
                }
            }
            console.log('\n');
            return apiReturn;
        } else {
            return [];
        }

    } catch (e) {
        if (e.response.status === 403) {
            console.log(`\n\x1b[31mAccess denied: Please check your API key in config file.`);
        } else if (e.response.status === 502) {
            console.log(`\n\x1b[31mServer error, please contact administrator.`);
        } else {
            console.log(`\n\x1b[31m${e.message}`);
        }
        exit(2);
    }
}