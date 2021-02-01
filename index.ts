import fs from 'fs';
import Axios from 'axios';
import Table from "cli-table3"
import chalk from 'chalk';
import { Response } from './src/models/response';
import { Service } from './src/models/service-content';
import { ServiceItem } from './src/models/service-item';
import { ServiceResponse } from './src/models/service-response';
import { TotalCostResponse } from './src/models/total-cost-response';
import { BudgetStatus } from './src/models/budget-status';
import { BudgetResponse } from './src/models/budget-response';
import { parseYamlFromPath, constructTemplateBodyApi } from './src/utils/parser';
import { Currency } from './src/models/currency';
import { terminateApp } from './src/utils/app';
import { constructOutputFileInfo } from './src/utils/file';
import { TERMINATE_ON_ERROR } from './src/utils/constants';
import strip from 'strip-color';
const homedir = require('os').homedir();

function find(content: any, includeSearchContent: any[], excludeSearchContent?: any[], availableServices?: any[]) {
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

function proccessFile(
    cloudFormationFilePath: string,
    includeSearchContent: any[],
    excludeSearchContent?: any[],
    availableServices?: any[]
) {
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

function proccessDirectory(
    cloudFormationDirPath: string,
    includeSearchContent: any[],
    excludeSearchContent?: any[],
    availableServices?: any[],
    additionalContentFromFilePath?: string
) {
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

export async function proccessFromConfigFile(filePath: string, shouldShowJson: boolean, shouldOutputToFile: boolean) {
    // console.log(`proccessFromConfigFile ${filePath}`);
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
            // console.log(`url: ${baseUrl}/${config.api.templateEndpoint}`);
            // console.log(`header: ${JSON.stringify(config.api.header)}`);
            // console.log(`body: ${constructTemplateBodyApi(arrayResult, c, config.budget, config.region)}`);
            // console.log(`data: ${JSON.stringify(arrayResult, null, 2)}`);

            const apiReturn: Response = await Axios.post(
                `${baseUrl}/${config.api.templateEndpoint}`,
                constructTemplateBodyApi(arrayResult, c, config.budget, config.region),
                {
                    headers: config.api.header
                }
            );

            if (shouldShowJson) {
                console.log(`returned data: ${JSON.stringify(apiReturn.data, null, 2)}`);
            }

            const table = new Table({
                wordWrap: true,
                chars: {
                    'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
                    , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
                    , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
                    , 'right': '', 'right-mid': '', 'middle': ''
                },
                style: {
                    'padding-left': 2, 'padding-right': 2
                }
            });
            const a: any[] = [];
            let budgetResponse: BudgetResponse | null = null;
            apiReturn.data.forEach((service: any | Service | BudgetResponse | TotalCostResponse) => {
                // console.log(`service --> ${JSON.stringify(service)}`);

                let group: String = '';

                for (var serviceKey in service) {
                    // console.log(`Service Key: --> ${serviceKey}`);

                    if (serviceKey.includes('LY (')) {
                        if (serviceKey.includes('DAILY')) {
                            table.push([null, null, null]) // spacer
                        }
                        table.push(
                            [ null, { hAlign: 'right', content: chalk.white(serviceKey)}, chalk.green.bold('$' + `${(service[serviceKey] as TotalCostResponse).price}`)], // Note: the /t in content
                        );
                        continue;
                    }

                    if (serviceKey.toLowerCase().includes('budget')) {
                        budgetResponse = service[serviceKey];
                        continue;
                    }

                    if (serviceKey.toLowerCase().includes('notimplemented')) {
                        continue;
                    }

                    if (serviceKey.toLowerCase().includes('system')) {
                        continue;
                    }

                    let serviceObj: Service = service[serviceKey];
                    group = serviceObj.group;
                    table.push(
                        [{ colSpan: 3, content: chalk.bold.keyword('orange')(group) }],
                        [{ colSpan: 3, content: '[' + chalk.keyword('grey')(` ${serviceKey}`) + ' ]'}],
                    );

                    let serviceItems: any[] = serviceObj.items;

                    if (serviceItems.length == 0) {
                        /* Do nothing */
                        continue;
                    } else {

                        serviceItems.forEach((serviceItemObj: any) => {
                            var serviceItemKey: string = '';
                            // console.log(`Service Items length: --> ${serviceItems.length}`);
                            for (serviceItemKey in serviceItemObj) {
                                // console.log(`Service Item Key: --> ${serviceItemKey}`);
                                let serviceItem: ServiceItem = serviceItemObj[serviceItemKey];
                                table.push(
                                    [chalk.grey('|- ') + chalk.white.bold(`${serviceItemKey}`), serviceItem.description, chalk.green.bold('$' + `${serviceItem.price}`)],
                                    [chalk.grey('|-- units '), chalk.grey(`${serviceItem.units} ${serviceItem.uom}`), null],
                                );
                            }

                        });

                        continue;
                    }
                }

            });
            console.log('\n');
            console.log(table.toString());
            let budgetMessage = null;

            if (budgetResponse !== null) {
                switch ((budgetResponse as BudgetResponse).status) {
                    case BudgetStatus.NORMAL:
                        budgetMessage = `Budget: ${chalk.green((budgetResponse as BudgetResponse).message)}`;
                        console.log(budgetMessage);
                        break;
                    case BudgetStatus.WARNING:
                        budgetMessage = `Budget: ${chalk.yellow((budgetResponse as BudgetResponse).message)}`;
                        console.log(budgetMessage);
                        break;
                    case BudgetStatus.ERROR:
                        budgetMessage = `Budget: ${chalk.red((budgetResponse as BudgetResponse).message)}`;
                        console.log(budgetMessage);
                        break;
                    default:
                        budgetMessage = `Budget: ${chalk.red('Unknown message')}.`;
                        console.log(budgetMessage);
                        break;
                }
            }
            console.log('\n');

            if (shouldOutputToFile) {
                const newFile = constructOutputFileInfo(filePath);
                const outFile = fs.createWriteStream(newFile, { flags: 'w' });
                const processOut = process.stdout;
                outFile.write(strip(table.toString()));
                outFile.write('\n');
                if (budgetMessage !== null) {
                    outFile.write(`${strip(budgetMessage)}`);
                }
                outFile.write('\n');
                processOut.write('\n');
            }

            return apiReturn;
        } else {
            return [];
        }

    } catch (e) {
        // if the url is incorrect it won't have a response object
        if (e.response) {
            if (e.response.status === 400) {
                console.log(`\n${chalk.red('Bad request.')}`);
            }
            else if (e.response.status === 403) {
                console.log(`\n${chalk.red('Access denied: Please check your API key in config file.')}`);
            }
            else if (e.response.status === 429) {
                console.log(`\n${chalk.red('Too many requests or limit reached.')}`);
            }
            else if (e.response.status === 500) {
                console.log(`\n${chalk.red('Internal error, please contact administrator.')}`);
            }
            else if (e.response.status === 502) {
                console.log(`\n${chalk.red('Bad gateway, please contact administrator.')}`);
            }
            else if (e.response.status === 503) {
                console.log(`\n${chalk.red('Unavailable, please try again.')}`);
            }
            else if (e.response.status === 504) {
                console.log(`\n${chalk.red('Timeout, please try again.')}`);
            } else {
                console.log(`\n${chalk.red(e.message)}`);
            }

        } else {
            console.log(`\n${chalk.red(e.message)}`);
        }
        terminateApp(TERMINATE_ON_ERROR);
    }
}