# [tcup](https://cup.talkncloud.com)

[![GitHub license](https://img.shields.io/github/license/talkncloud/tnc-cup-client?color=blue&style=flat-square)](https://github.com/talkncloud/tnc-cup-client/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@talkncloud/tnc-cup?style=flat-square)](https://www.npmjs.com/package/@talkncloud/tnc-cup)
[![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/talkncloud/tnc-cup-client?style=flat-square&targetFile=package.json)](https://snyk.io/test/github/talkncloud/tnc-cup-client?targetFile=package.json)


**Note**: This is currently in **PREVIEW**. There will be bugs, we will fix the bugs. 

talkncloud checkup (tcup) has been developed by [talkncloud](https://www.talkncloud.com) and is a client for AWS price estimation. This cli client will parse cloudformation templates and post revelvant sections to the tcup backend api to provide a price estimate.

Some key features:
  * Parse cloudformation & CDK (transpiled CF out)
  * Minimize post data by configuring client to remove key sections
  * Convert the estimate into your local currency
  * Support for multiple regions
  * Set a budget threshold
  * CI/CD friendly with error 0, 1, 2
  * Cli output with tabular display

## How to Install ##

```
npm install -g @talkncloud/tcup
```

tcup can now be used from the terminal simply by running "tcup"

## Configuration ##

The local configuration contains common configuration parameters required to use tcup. The configuration file is located in the $HOME directory named ".config.json".

Install the sample config file by running the following command

```
tcup config
```

a new file will be created in $HOME/.config/tcup.json

## Configuration Parameters ##

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
| currency | string | `USD` | three letter country code to convery currency |
| budget | string | `50.00` | budget allocated for this template |
| region | string | `ap-southeast-2` | AWS compatible region code |


## API KEY ##

Go to [tcup](https://cup.talkncloud.com/signup) to register, once registered use the dashboard to generate an API KEY. Use this key to update your config.json.

## Cli usage ##

```
USAGE
  $ tcup [COMMAND]

COMMANDS
  config  configure the local config file
  cost    perform cloud cost estimation
  help    display help for tcup
```

### cost usage
```
USAGE
  $ tcup cost [OPTS]

OPTIONS
  -c, --config             generate cost configuration parameter file from template
  -h, --help               show CLI help
  -j, --json               prepend json api response to stdout
  -o, --output             output results to plain text
  -t, --template=template  (required) template to read
```

## Example ##

1. Navigate to your directory with the cloudformation template
2. tcup -t mytemplate.json || yaml

```

  [ DynamoDB ]                                                                                              
  |> tncdb38B2E622                                                                                          
  |- rcu        $0.00013 per hour for units of read capacity beyond the free tier                 $2.6    
  |-- units     20000 RCU                                                                                 
  |- storage    $0.25 per GB-Month of storage used beyond first 25 free GB-Months                 $166.5  
  |-- units     666 GB                                                                                    
  |- wcu        $0.00065 per hour for units of write capacity beyond the free tier                $13     
  |-- units     20000 WCU                                                                                 
  [ Cognito ]                                                                                               
  |> tncup                                                                                                  
  |- pool       Cognito User Pools us-east-1 tier 1 pricing                                       $27.5   
  |-- units     5000 USER                                                                                 
  [ AppSync ]                                                                                               
  |> api                                                                                                    
  |- api        $4 per million query and data modification operations in US East (N. Virginia)    $40     
  |-- units     10000000 REQ                                                                              
  [ WAFv2 ]                                                                                                 
  |> waf                                                                                                    
  |- req        $0.60 per million requests processed                                              $0.06   
  |-- units     100000 REQ                                                                                
  |- rule       $1.00 per rule created (prorated hourly)                                          $3      
  |-- units     3 RULE                                                                                    
  |- acl        $5.00 per web ACL created (prorated hourly)                                       $5      
  |-- units     1 COUNT                                                                                   
                                                                                                          
                                                                                   DAILY (USD)    $9      
                                                                                  WEEKLY (USD)    $64     
                                                                                 MONTHLY (USD)    $258    
Budget: over monthly budget by $157 (USD)

```

## SUPPORTED SERVICES ##
At this time we only support AWS. A list of supported AWS services can be found here:
[services](https://github.com/talkncloud/tnc-cup-client/blob/main/AWS_SERVICES.md)


## API ##
tcup consists of a client that interfaces with the backend api. The backend api exposes a few endpoints and can be queried using typical curl tools. 

### Authorization ###
In general, to use the API you'll need an API key, the keys have typical rate limiting etc enabled. To use the endpoints below add the following to the header:

`x-api-key: 'YOUR AWESOME KEY HERE'`

### Endpoints ###

**Post body to api**
```http
POST /template
```
> Body
```javascript
[{"file":[{"WebInstance":{"Type":"AWS::EC2::Instance","Properties":{"BlockDeviceMappings":[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":24000,"VolumeType":"gp3"}}],"InstanceType":"t2.nano","ImageId":"ami-80861296","KeyName":"my-key","Monitoring":true,"SecurityGroupIds":[{"class":"Ref","name":"Ref","data":"WebSecurityGroup"}],"SubnetId":"subnet-abc01234","Tags":[{"Key":"Name","Value":"webserver"}],"Volumes":[{"Device":"/dev/sdf","VolumeId":{"class":"Ref","name":"Ref","data":"LogVolume"}}]}}}],"currency":{"code":"USD"},"budget":10, "region": "us-east-1"}]
```
> Response
```javascript
[
    {
        "EC2": {
            "Compute": {
                "description": "$0.0058 per On Demand Linux t2.nano Instance Hour - ami: Canonical, Ubuntu, 16.04 LTS, amd64 xenial image build on 2017-04-14",
                "price": 4.0
            },
            "Storage-AMI": {
                "description": "$0.10 per GB-month of General Purpose SSD (gp2) provisioned storage - US East (Northern Virginia) size: 8GB",
                "price": 0.8
            },
            "Storage": {
                "description": "$0.005 per provisioned IOPS-month of gp3 - US East (N. Virginia) size: 24000GB",
                "price": 120.0
            }
        }
    },
    {
        "TOTAL (USD)": {
            "description": "Total estimated price (USD)",
            "price": 125
        }
    },
    {
        "budget": {
            "status": 1,
            "message": "over budget by $114 (USD)"
        }
    }
]
```
**List current supported services**
```http
GET /services
```
> Response
```javascript
{
    "AppSync:GraphQLApi": "AWS::AppSync::GraphQLApi",
    "Cognito:UserPool": "AWS::Cognito::UserPool",
    "EC2:Instance": "AWS::EC2::Instance",
    "EC2:Volume": "AWS::EC2::Volume",
    "RDS:DBInstance": "AWS::RDS::DBInstance",
    "S3:Bucket": "AWS::S3::Bucket",
    "WAFv2:WebACL": "AWS::WAFv2::WebACL"
}
```
**List supported currencies for conversion**
```http
GET /currency
```
> Response

```javascript
{
    "results": {
        "ALL": {
            "currencyName": "Albanian Lek",
            "currencySymbol": "Lek",
            "id": "ALL"
        },
        "XCD": {
            "currencyName": "East Caribbean Dollar",
            "currencySymbol": "$",
            "id": "XCD"
        },
        "EUR": {
            "currencyName": "Euro",
            "currencySymbol": "€",
            "id": "EUR"
        }...
```

### API response codes ###

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 400 | `BAD REQUEST` |
| 403 | `ACCESS DENIED` |
| 429 | `TOO MANY REQUESTS / LIMIT` |
| 500 | `INTERNAL SERVER ERROR` |
| 502 | `BAD GATEWAY` |
| 503 | `UNAVAILABLE` |
| 504 | `TIMEOUT` |

### Tuning additional cost calculations ###
There are default pricing calculations that have been implemented, where possible items have been extracted from the template provided, but pricing is complicated there can be many options. The additional calculations are availabe at the /services endpoint within the calculations object. These are the available calculations. These options can considerably change your final price estimate.

When you use the '-t myfile.json -c' switches a new calc file will be generated next to myfile.json. Update the values for the calculations in this file and they'll be sent the next time you run an estimate.

### Contributing ###

Yes please! Check out our [contribution](https://github.com/talkncloud/tnc-cup-client/blob/main/CONTRIBUTING.md) guide.