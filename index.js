#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompts = require("prompts");
const configs_1 = require("./configs");
const migrate_1 = require("./lib/migrate");

const mysqlPrompts = [
    {
        type: 'text',
        name: 'mysqlhost',
        message: 'MySQL database host address?',
        initial: '127.0.0.1',
    },
    {
        type: 'text',
        name: 'mysqlusername',
        message: 'MySQL database authentication username?',
        initial: 'root',
    },
    {
        type: 'password',
        name: 'mysqlpassword',
        message: 'MySQL database authentication password?',
    },
    {
        type: 'text',
        name: 'mysqldatabase',
        message: 'MySQL database name?',
    },
];


(async () => {
    // @ts-ignore
    const mysqlConn = new configs_1.Database(configs_1.mysqlConfig(await prompts(mysqlPrompts)));
    // @ts-ignore
    const migrate = new migrate_1.Migrate({ mysqlconn: mysqlConn });
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
    // @ts-ignore
    await migrate.generateKwilSchemas();

    await migrate.populateKwil().catch(e => {console.log(e); process.exit();});
})();
