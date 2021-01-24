//import chalk from 'chalk';
import * as chalk from 'chalk';
// import { promises as fs } from 'fs';
import * as fs from 'fs';
import * as Table from "cli-table3"

// Show the parsed data
//console.log(marked('# a basic string\nwith stuff'));

// https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201
// talks about advantages of end, too many open files with appendFile

// TODO: we are going to want the filename from the run e.g. AppSync_Cognito_Waf.json > AppSync_Cognito_Waf.tcup.json
// const file = 'MICK_TEST.md'
// //let newFile = fs.createWriteStream(file, {flags: 'w'}) // we want to wipe it each time
// let newFile = fs.createWriteStream(file) // we want to wipe it each time
// //use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file

// // header
let today = new Date().toLocaleString()

// spinner https://timber.io/blog/creating-a-real-world-cli-app-with-node/ - ora

let table = new Table({
    wordWrap: true,
    chars: {
            'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
            , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
            , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
            , 'right': '' , 'right-mid': '' , 'middle': '' 
        },
    style: {
        'padding-left': 0, 'padding-right': 0
    }
})

console.log('\n')

// TODO: API to provide API version
table.push(
    [{ colSpan: 3, content: chalk.blue.bold('Info') }],
    [{ colSpan: 3, content: chalk.keyword('grey')(' tcup') }],
    [chalk.white.bold('  date:'), '\t' + today, '\t'],
    [chalk.white.bold('  client:'), '\t0.0.35', '\t'],
    [chalk.white.bold('  api:'), '\t0.0.1', '\t'],
    [ '\t', '\t', '\t'] // needs to be /t otherwise throws off formatting
);

table.push(
    [{ colSpan: 3, content: chalk.bold.keyword('orange')('DynamoDB') }],
    [{ colSpan: 3, content: chalk.keyword('grey')(' tncdb38b2e622') }],
    [chalk.white.bold('  rcu:'), '\t$0.00013 per hour for units of read capacity beyond the free tier', chalk.green.bold('\t$166.5')],
    [chalk.grey('   units:'), chalk.grey('\t1000 REQ'), '\t'],
    [chalk.white.bold('  wcu:'), '\t$0.00065 per hour for units of write capacity beyond the free tier', chalk.green.bold('\t$13')],
    [chalk.grey('   units:'), chalk.grey('\t1000 REQ'), '\t'],
    [chalk.white.bold('  storage:'), '\t$0.25 per GB-Month of storage used beyond first 25 free GB-Months', chalk.green.bold('\t$2.6')],
    [chalk.grey('   units:'), chalk.grey('\t50 GB'), '\t'],
);

table.push(
    [{ colSpan: 3, content: chalk.bold.keyword('orange')('Cognito') }],    
    [{ colSpan: 3, content: chalk.keyword('grey')(' tncup') }],
    [chalk.white.bold('  pool:'), '\tCognito User Pools us-east-1 tier 1 pricing', chalk.green.bold('\t$40')],
    [chalk.grey('   units:'), chalk.grey('\t5000 USER'), '\t']
);

table.push(
    ['\t', { hAlign: 'right', content: chalk.green.bold('TOTAL (USD)') }, '\t'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('hour:') }, chalk.green.bold('\t$20 USD')], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('day:') }, chalk.green.bold('\t$100 USD')], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('month:') }, chalk.green.bold('\t$1000 USD')], // Note: the /t in content
    [ '\t', '\t', '\t'] // needs to be /t otherwise throws off formatting
);

// If currency conversion
// TODO: API to provide hour, day, month
table.push(    
    ['\t', { hAlign: 'right', content: chalk.green.bold('TOTAL (AUD)') }, '\t'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('hour:') }, chalk.green.bold('\t$30 AUD')], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('day:') }, chalk.green.bold('\t$130 AUD')], // Note: the /t in content
    ['\t', { hAlign: 'right', content: chalk.white.bold('month:') }, chalk.green.bold('\t$1200 AUD')], // Note: the /t in content
);

// terminal stdout
console.log(table.toString());
console.log('Budget: ' + chalk.yellow('over budget by $100 AUD'))
console.log('Budget: ' + chalk.green('normal'))
console.log('System: ' + chalk.red('this is red'))
console.log('\n')

// PLAIN TEXT OUT
// if -o-plain
// Reset the table, plain text need to remove the colors
table.length = 0

// TODO: API to provide API version
table.push(
    [{ colSpan: 3, content: 'Info' }],
    [{ colSpan: 3, content: ' tcup' }],
    ['  date:', '\t' + today, '\t'],
    ['  client:', '\t0.0.35', '\t'],
    ['  api:', '\t0.0.1', '\t'],
    [ '\t', '\t', '\t'] // needs to be /t otherwise throws off formatting
);

table.push(
    [{ colSpan: 3, content: 'DynamoDB' }],
    [{ colSpan: 3, content: ' tncdb38b2e622' }],
    ['  rcu:', '\t$0.00013 per hour for units of read capacity beyond the free tier', { hAlign: 'left', content: '\t$166.5'}],
    ['   units:', '\t1000 REQ', '\t'],
    ['  wcu:', '\t$0.00065 per hour for units of write capacity beyond the free tier', { hAlign: 'left', content: '\t$13'}],
    ['   units:', '\t1000 REQ', '\t'],
    ['  storage:', '\t$0.25 per GB-Month of storage used beyond first 25 free GB-Months', { hAlign: 'left', content: '\t$2.6'}],
    ['   units:', '\t50 GB', '\t'],
);

table.push(
    [{ colSpan: 3, content: 'Cognito' }],    
    [{ colSpan: 3, content: ' tncup' }],
    ['  pool:', '\tCognito User Pools us-east-1 tier 1 pricing', { hAlign: 'left', content: '\t$40'}],
    ['   units:', '\t5000 USER', '\t']
);

table.push(
    ['\t', { hAlign: 'right', content: '\tTOTAL (USD)' }, '\t'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\thour:' }, '\t$20'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\tday:' }, '\t$100'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\tmonth:' }, '\t$1000'], // Note: the /t in content
    [ '\t', '\t', '\t'] // needs to be /t otherwise throws off formatting
);

// If currency conversion
// TODO: API to provide hour, day, month
table.push(    
    ['\t', { hAlign: 'right', content: '\tTOTAL (AUD)' }, '\t'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\thour:' }, '\t$30'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\tday:' }, '\t$130'], // Note: the /t in content
    ['\t', { hAlign: 'right', content: '\tmonth:' }, '\t$1200'], // Note: the /t in content
);

// NOTE: get file name, added .tcup.txt
let outFile = fs.createWriteStream('Appsync_Cognito_Waf.tcup.txt', { flags: 'w' }) // plain text, overwrite
let processOut = process.stdout;
outFile.write(table.toString())
outFile.write('\n')
outFile.write('Budget: over budget by $100 AUD\n')
outFile.write('Budget: normal\n')
outFile.write('System: this is red\n')
processOut.write('\n')

// MARKDOWN
// if -o-markdown
// Reset the table, plain text need to remove the colors
let file = 'Appsync_Cognito_Waf.tcup.md' // get file name, added .tcup.txt
let newFile = fs.createWriteStream(file, {flags: 'w'}) // we want to wipe it each time
// newFile.write('# tcup - cost estimation\n')
// newFile.write('*date:*  \t' + today + '\n')
// newFile.write('*client:*\t0.0.35\n')
// newFile.write('*api:*   \t0.0.1\n')
// newFile.write('\n')
// Reset the table, plain text need to remove the colors
table.length = 0

// TODO: API to provide API version
newFile.write('### Tcup  \n')
newFile.write('**date**: ' + today +  '  \n')
newFile.write('**client**: 0.0.35  \n')
newFile.write('**api**: 0.0.35  \n')
//newFile.write('---')

newFile.write('| Service | Item | Description | Cost |  \n')
newFile.write('|---|---|---|--:|  \n')
newFile.write('| **DynameDB** | | | |  \n')
newFile.write('| tncdb38b2e622 | | | |  \n')
newFile.write('| |**rcu**|$0.00013 per hour for units of read capacity beyond the free tier|$166.5|  \n')
newFile.write('| |*units*|*1000 REQ*| |  \n')
newFile.write('| |**wcu**|$0.00013 per hour for units of read capacity beyond the free tier|$126.5|  \n')
newFile.write('| |*units*|*1000 REQ*| |  \n')
newFile.write('| |**storage**|$0.25 per GB-Month of storage used beyond first 25 free GB-Months|$300|  \n')
newFile.write('| |*units*|*50 GB*| |  \n')

//newFile.write('| | | | |  \n')
newFile.write('| **Cognito** | | | |  \n')
newFile.write('| tncup | | | |  \n')
newFile.write('| |**pool**|Cognito User Pools us-east-1 tier 1 pricing|$100|  \n')
newFile.write('| |*units*|*5000 USER*| |  \n')

newFile.write('| **TOTAL (USD)** | | | |  \n')
newFile.write('| | |**hour**|$100|  \n')
newFile.write('| | |**week**|$100|  \n')
newFile.write('| | |**month**|$100|  \n')

newFile.write('| **TOTAL (AUD)** | | | |  \n')
newFile.write('| | |**hour**|$200|  \n')
newFile.write('| | |**week**|$300|  \n')
newFile.write('| | |**month**|$400|  \n')


//newFile.write(table.toString())
newFile.write('  \n')
newFile.write('  \n')
newFile.write('**Budget**: over budget by $100 AUD  \n')
newFile.write('**Budget**: normal  \n')
newFile.write('**System**: this is red  \n')

// footer

// close it up
newFile.end(); // don't technically need to this, but i like knowing.
//newFile.on('close', readAfter) // listen for disk flush, then proceed to read

// If you want to read it straight after - read the file
// function readAfter() {
//     try {
//         const reader = fs.readFileSync(file);
//         console.log('\n') // just wanted some space
//         console.log(marked(reader.toString()));
//     } catch {
//         console.error('read file error')
//     }
// }