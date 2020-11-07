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
const tncCup = require('TOBEUPDATED');
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
