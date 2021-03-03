import { Command, flags } from '@oclif/command'
import fs, { exists } from 'fs';
import path from 'path';
import Axios from 'axios';
import Table from "cli-table3";
import chalk from 'chalk';
import { Response } from '../models/response';
import { Service } from '../models/service-content';
import { ServiceItem } from '../models/service-item';
import { TotalCostResponse } from '../models/total-cost-response';
import { BudgetStatus } from '../models/budget-status';
import { BudgetResponse } from '../models/budget-response';
import { parseYamlFromPath, constructTemplateBodyApi } from '../utils/parser';
import { Currency } from '../models/currency';
import {
    constructOutputFileInfo,
    isFileExist,
    readFileContent,
    constructFileInfo,
    proccessFile,
    processFileForCalcs
} from '../utils/file';

import strip from 'strip-color';
import cli from 'cli-ux';
import { string } from '@oclif/parser/lib/flags';
import { FileInfo } from '../models/file-info';

export default class Cost extends Command {
    static description = 'perform cloud cost estimation';

    static flags = {
        help: flags.help({ char: 'h' }),
        template: flags.string({ char: 't', description: 'template to read', required: true }),
        json: flags.boolean({ char: 'j', description: 'prepend json api response to stdout', dependsOn: ['template'] }),
        config: flags.boolean({ char: 'c', description: 'generate cost configuration parameter file from template', dependsOn: ['template'] }),
        output: flags.boolean({ char: 'o', description: 'output results to plain text', dependsOn: ['template'] }),
    }

    // displayed during help
    static args = [{ name: 'OPTS' }]

    async run() {
        const { args, flags } = this.parse(Cost)

        let configFile = path.join(this.config.configDir, 'config.json')

        if (!(fs.existsSync(configFile))) {
            this.error('config not found, please run config')
        } else {
            var config = parseYamlFromPath(configFile)
        }

        const templateFilePath = flags.template;

        var outFile: fs.WriteStream;
        var content: string = '';
        var hasConfig: boolean = false;
        var newFile: FileInfo = constructFileInfo(templateFilePath, 'calcs', 'json');
        if (isFileExist(newFile.fullPath)) {
            hasConfig = true;
            if (flags.config) {
                this.error('config file is already existed, please modify it directly and rerun without -c option');
            }
            content = readFileContent(newFile.fullPath);
        } else {
            hasConfig = false;
        }

        cli.action.start('crunching numbers')

        // console.log(`proccessFromConfigFile ${filePath}`);
        try {
            //const config = parseYamlFromPath(`${homedir}/.tnc-cup.config.json`);

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
            const finalCalcServices: any[] = [];
            finalCalcServices.push(...processFileForCalcs(templateFilePath, services));
            // console.log(`finalCalcServices --> ${JSON.stringify(finalCalcServices, null, 2)}`);

            if (flags.config) {
                outFile = fs.createWriteStream(`${newFile.fullPath}`, { flags: 'w' });
                outFile.write(`${JSON.stringify(finalCalcServices, null, 2)}`);
                outFile.close();
                content = JSON.stringify(finalCalcServices, null, 2);
                hasConfig = true;
                cli.action.stop();
                console.log('calc file created')
                return
                //this.exit(); // stop processing, simply config and exit
            }

            if (flags.json) {
                console.log(`Available Services: ${JSON.stringify(finalCalcServices, null, 2)}`);
            }

            let arrayResult = [];
            arrayResult.push(...proccessFile(templateFilePath, config.find.include, config.find.exclude, finalCalcServices).data);
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
                    constructTemplateBodyApi(arrayResult, content, hasConfig, c, config.budget, config.region),
                    {
                        headers: config.api.header
                    }
                );

                if (flags.json) {
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
                                [null, { hAlign: 'right', content: chalk.white(serviceKey) }, chalk.green.bold('$' + `${(service[serviceKey] as TotalCostResponse).price}`)], // Note: the /t in content
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
                            [{ colSpan: 3, content: '[ ' + chalk.bold.keyword('orange')(group) + ' ]' }],
                            //[{ colSpan: 3, content: '[' + chalk.keyword('grey')(` ${serviceKey}`) + ' ]'}],
                            [{ colSpan: 3, content: '|>' + chalk.keyword('grey')(` ${serviceKey}`) }],
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

                if (flags.output) {
                    const newFile = constructOutputFileInfo(templateFilePath);
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

                cli.action.stop()
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
            //terminateApp(TERMINATE_ON_ERROR);
            this.error(chalk.red('error'), { exit: 2 }) // new exit type
        }

    }

}
