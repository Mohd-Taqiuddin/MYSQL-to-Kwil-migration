import * as ora from 'ora';


const KwilDB = require('kwildb');
const fs = require('fs');


let privateKey = fs.readFileSync('privateKey.json');
privateKey = JSON.parse(privateKey.toString());
const secret = 'test';


export const kwilDB = KwilDB.createConnector({
    host: 'test-db.kwil.xyz',
    protocol: 'https',
    moat: 'migration_task',
    privateKey: privateKey,
}, secret)


export function connect(){
    
    const spinner = ora('Establishing KwilDB connection').start();  

    try{
        KwilDB.createConnector({
            host: 'test-db.kwil.xyz',
            protocol: 'https',
            moat: 'migration_task',
            privateKey: privateKey,
            }, secret
        )
        spinner.succeed('KwilDB connection established. Press any key to continue. \n').stop();
    }
    catch(err){
        spinner.fail(`KwilDB connection error ${err}`).stop();
        process.exit();
    }

}