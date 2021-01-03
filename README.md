# [tnc-cup](https://cup.talkncloud.com) 

[![GitHub license](https://img.shields.io/github/license/talkncloud/tnc-cup-client?color=blue&style=flat-square)](https://github.com/talkncloud/tnc-cup-client/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@talkncloud/tnc-cup?style=flat-square)](https://www.npmjs.com/package/@talkncloud/tnc-cup)

**Note**: This is currently in **PREVIEW**. There will be bugs, we will fix the bugs. 

talkncloud checkup (tnc-cup) has been developed by [talkncloud](https://www.talkncloud.com) and is a client for AWS price estimation. This cli client will parse cloudformation templates and post revelvant sections to the tnc-cup backend api to provide a price estimate.

Some key features:
  * Parse cloudformation & CDK (transpiled CF out)
  * Minimize post data by configuring client to remove key sections
  * Convert the estimate into your local currency
  * Support for multiple regions
  * Set a budget threshold
  * CI/CD friendly with error 0, 1, 2
  * Cli output with tabular display

**How to Install**

```
npm install -g @talkncloud/tnc-cup
```

tnc-cup can now be used from the terminal simply by running "tnc-cup"

**Configuration**

The local configuration contains common configuration parameters required to use tnc-cup. The configuration file is located in the $HOME directory named ".tnc-cup.config.json".

Install the sample config file by running the following command

```
tnc-cup -c
```

a new file will be create in $HOME/.tnc-cup.config.example.json

**Configuration Parameters**

| Key | Type | Possible values | Description |
|---|---|---|---|
| api | object | | Required |
| api.baseUrl | string | https://api.talkncloud.com | Required, fixed |
| api.version | string | `client` | Required, fixed |
| api.header | object | | Required |
| api.header.x-api-key | string | `some api key` | Required | 
| templateEndpoint | string | `template` | Required, where data is posted to  - /template |
| servicesEndpoint | string | `services` | Required, list of supported services  - /services |
| find | object | |
| find.include | array | `["AWS::CDK::Metadata"]` | if include empty or undefined, it will show all resources |
| find.exclude | array | `["AWS::CDK::Metadata"]` | exclude will override include |
| other | array | [] | placeholder for future implementation |
| currency | string | `USD` | three letter country code to convery currency |
| budget | float | `50.00` | budget allocated for this template |
| region | string | `ap-southeast-2` | AWS compatible region code |


**API KEY**

Go to [tnc-cup](https://cup.talkncloud.com/signup) to register, once registered use the dashboard to generate an API KEY. Use this key to update your tnc-cup.config.json.

**API**

