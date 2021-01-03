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

`npm install -g @talkncloud/tnc-cup`

**How to use**

**CLI**

```
tnc-cup config.json
```

If file not specified, it will get .tnc-cup.config.json from $HOME directory

**Generate sample config file**

```
tnc-cup -g
```

**As package in code**

```
const tncCup = require('@talkncloud/tnc-cup');
tncCup.proccessFromConfigFile('./config.json');
```

**Config Details**

| Key | Type | Possible values | Description |
|---|---|---|---|
| files | array | `["cf.json", "cf.yaml"]`| Files OR directories required |
| directories | array | `["dir1", "dir2"]`| Files OR directories required |
| url | object | | Required |
| url.url | string | https://127.0.0.1/ |
| url.header | object | `{ "content-type": "application/json"}`|
| find | object | |
| find.include | array | `["AWS::CDK::Metadata"]` | if include empty or undefined, it will show all resources |
| find.exclude | array | `["AWS::CDK::Metadata"]` | exclude will override include |
| other | array | [] | additional information that will send to API |


Example:
```
{
  "files": ["cf.json", "cf.yaml"],
  "directories": ["dir"],
  "url": {
    "url": "https://127.0.0.1",
    "header": {
      "x-api-key": "talkncloud"
    }
  },
  "find": {
    "include": ["AWS::CDK::Metadata"],
    "exclude": []
  },
  "other": [
    "key"
  ]
}
```
