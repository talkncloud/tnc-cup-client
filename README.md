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

## How to Install ##

```
npm install -g @talkncloud/tnc-cup
```

tnc-cup can now be used from the terminal simply by running "tnc-cup"

## Configuration ##

The local configuration contains common configuration parameters required to use tnc-cup. The configuration file is located in the $HOME directory named ".tnc-cup.config.json".

Install the sample config file by running the following command

```
tnc-cup -c
```

a new file will be create in $HOME/.tnc-cup.config.example.json

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
| other | array | [] | placeholder for future implementation |
| currency | string | `USD` | three letter country code to convery currency |
| budget | float | `50.00` | budget allocated for this template |
| region | string | `ap-southeast-2` | AWS compatible region code |


## API KEY ##

Go to [tnc-cup](https://cup.talkncloud.com/signup) to register, once registered use the dashboard to generate an API KEY. Use this key to update your tnc-cup.config.json.

## Cli parameters ##

1. -c = generate configuration file
2. -t = template file to parse

## Example ##

1. Navigate to your directory with the cloudformation template
2. tnc-cup -t mytemplate.json | yaml

<img src="https://cup.talkncloud.com/img/tnc-cup-client-sample.f731cf0c.png" alt="alt text" title="example output" />


## API ##
tnc-cup consists of a client that interfaces with the backend api. The backend api exposes a few endpoints and can be queried using typical curl tools. 

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