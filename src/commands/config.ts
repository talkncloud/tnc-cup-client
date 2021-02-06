import { Command, flags } from '@oclif/command';
import { prompt } from 'enquirer';
import cli from 'cli-ux';
import path from 'path';
import chalk from 'chalk';
import * as fs from 'fs-extra';

//import { credentials } from '../utils/config/credentials';

export default class Config extends Command {
  static description = 'configure the local config file'

  // static flags = {
  //   help: flags.help({char: 'h'}),
  //   // flag with a value (-n, --name=VALUE)
  //   app: flags.boolean({char: 'a', description: 'generate app configuration file'}),
  //   // flag with no value (-f, --force)
  //   //force: flags.boolean({char: 'f'}),
  // }

  // static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Config)
    //const config = path.join(this.config.configDir, 'config.json')

    //this.log('sign up for your API key ' + chalk.blue('https://cup.talkncloud.com/signup'))
    const signUpUrl = 'https://cup.talkncloud.com/signup'

    const confirmRegistration = async (valid) => {
      if (valid === false) {
        return 'you need an api key from registration'
      }
      return true;
   };

   //const userConfig = await fs.readJSON(path.join(this.config.configDir, 'config.json'))
   const userConfig = path.join(this.config.configDir, 'config.json')

  //  this.log('User config:')
  //  console.dir(userConfig)

    const response = await prompt([
      {
        type: 'confirm',
        name: 'signup',
        message: 'Have you registered? [' + chalk.blue(signUpUrl) + ']',
        required: true,
        initial: 'Y',
        validate: confirmRegistration
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'What is your API KEY?',
        required: true
      },
      {
        type: 'input',
        name: 'currency',
        message: 'what is your local currency?',
        default: 'USD',
        required: true
      },
      {
        type: 'input',
        name: 'budget',
        message: 'what is your max cloud budget for this project?',
        required: false
      },
      {
        type: 'input',
        name: 'region',
        message: 'what is your cloud region?',
        default: 'us-east-1',
        required: true
      }

    ]).then((answer) => {
      return answer      
    })

    // write the config file
    await fs.ensureDir(this.config.configDir);
    await fs.writeJson(userConfig, {
      api: { 
        "baseUrl": "https://apidev.talkncloud.com",
        "version": "client",
        "header": { "x-api-key": response.apiKey },
        "templateEndpoint": "template",
        "servicesEndpoint": "services"
      },
      currency: response.currency,
      budget: response.budget,
      region: response.region,
      find: {
        "include": [],
        "exclude": [
          "AWS::CDK::Metadata"
        ]
      }
    })

    this.log('Configuration file ' + chalk.green.bold('updated!'))

  }
}
