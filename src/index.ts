#!/usr/bin/env node
import * as prompts from 'prompts';
import { Database, mysqlConfig } from './configs';
// import { MongoConnection } from './configs/mongoconf';
import { Migrate } from './lib/migrate';
import { connect } from './configs/kwilconf';

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
    const mysqlConn = new Database(mysqlConfig(await prompts(mysqlPrompts)));
    // @ts-ignore
    const kwilConn = await connect().catch(e => process.exit());

    const migrate = new Migrate({ mysqlconn: mysqlConn });
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
    // @ts-ignore
    await migrate.generateKwilSchemas();
    // }

    await migrate.populateKwil().catch(e => process.exit());
})();
