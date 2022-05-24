"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ora = require("ora");
const path = require("path");
const datatypes_1 = require("./datatypes");
const KwilDB = require('kwildb');
const { exit } = require("process");


let privateKey = fs.readFileSync('privateKey.json');
privateKey = JSON.parse(privateKey.toString());
const secret = 'test';


const kwilDB = KwilDB.createConnector({
    host: 'test-db.kwil.xyz',
    protocol: 'https',
    moat: 'migration_task',
    privateKey: privateKey,
}, secret)


/**
 * Database migration utility. WIll migrate data from MySQL to MongoDb,
 * MySQL this.mysqldb name will be retained. All MySQL table names will be mapped to MongoDb collections,
 * MySQL model relationships will not be reinforced since MongoDB does not support schema relationships
 *
 * @export
 * @class Migrate
 */
class Migrate {
    constructor(options) {
        this.datafilesdir = path.join(process.cwd(), `/generated-json-data-files/`);
        this.modelsdirectory = path.join(process.cwd(), `/generated-schema-model-definitions/`);
        this.modelschemas = new Map();
        this.mysqldb = options.mysqlconn;
    }

    
    /**
     * Get table names from the selected / provided this.mysqldb.
     *
     * Will populate `this.models` property.
     *
     * @memberof Migrate
     */
    async retrieveModels() {
        const modelInfo = await this.mysqldb.query(`show full tables where Table_Type = 'BASE TABLE'`);
        this.models = modelInfo.map((res) => {
            return res[Object.keys(res)[0]];
        });
    }
    /**
     * Retrieve data for each model from MySQL, and generate corresponding data file in json.
     *
     * @memberof Migrate
     */
    async retrieveMysqlData() {
        if (this.models === undefined) {
            throw new Error(`Call retrieveModels to get MySQL models!`);
        }
        try {
            const files = fs.readdirSync(this.datafilesdir);
            if (files.length) {
                for await (const file of files) {
                    fs.unlinkSync(this.datafilesdir + file);
                }
            }
        }
        catch (_a) {
            fs.mkdirSync(this.datafilesdir);
        }
        for await (const model of this.models) {
            const modelData = await this.mysqldb.query(`select * from ${model}`);
            fs.writeFileSync(`${this.datafilesdir + model}.json`, JSON.stringify(modelData));
        }
        console.log(`Found ${this.models.length} models and wrote into json files in ${Math.floor(process.uptime())} s and `);
    }
    /**
     * Generate Schemas with corresponding data types as from MySQL. These schemas will used to populate data into KwilDB.
     *
     * Can be used later for another project, or deleted if not needed elsewhere anyways. Most common use case will be when taking over
     * a Node.js project using TypeScript.
     *
     * @memberof Migrate
     */
    async generateKwilSchemas() {
        const schemafiles = fs.readdirSync(this.datafilesdir);
        if (!schemafiles.length) {
            throw new Error('Empty directory!');
        }
        try {
            // delete previously generated models if any
            const models = fs.readdirSync(this.modelsdirectory);
            models.forEach(model => {
                fs.unlinkSync(this.modelsdirectory + model);
            });
            // tslint:disable-next-line:no-empty
        }
        catch (_a) { }
        for await (const schemafile of schemafiles) {
            let modelname = schemafile.split('.')[0];
            const definition = await this.mysqldb.query(`describe ${modelname}`);
            if (modelname.indexOf('_') !== -1) {
                modelname = modelname.split('_').join('');
            }
            modelname = modelname.slice(0, 1).toUpperCase() + modelname.slice(1);
            // add key value pairs to modelschemas, to map data-files to their corresponding model files
            this.modelschemas.set(schemafile, modelname);
            try {
                fs.mkdirSync(this.modelsdirectory);
            }
            catch (_b) {
                // do nothing if `models` directory exists
            }
            finally {
                let cols = '';
                const model = fs.createWriteStream(`${this.modelsdirectory + modelname}.ts`);
                let modeldefinition = '';
                for await (const field of definition) {
                    const datatype = field.Type.indexOf('(') !== -1 ? field.Type.split('(')[0] : field.Type;
                    modeldefinition += `{
                            colName: ${field.Field},
                            type: ${datatype},
                            required: ${field.Null === 'YES' ? false : true},
                            default: ${field.Default === 'CURRENT_TIMESTAMP' ? 'Date.now' : field.Default},
                    },\n`;

                    cols += field.Field + " " + datatype + ", ";
                }

                const table_query = await kwilDB.query(`CREATE TABLE IF NOT EXISTS ${modelname} (${cols.substring(0,cols.length-2)});`, true);

                // model.write(`\n\n\n\nexport default model('${modelname}', ${modelname});\n`);
                model.write(`export const ${modelname} = {${modeldefinition}};\n`); 
            }
        }
    }
    /**
     * Write / populate retrieved data into KwilDB, using previously generated Schemas and json data files.
     *
     * @returns {Promise<void>}
     * @memberof Migrate
     */
    async populateKwil() {
        if (this.modelschemas.size) {
            let counter = 0;
            const spinner = ora('Started data migration \n').start();
            spinner.color = 'blue';
            for await (const datafile of this.modelschemas) {
                const modeldata = fs.readFileSync(this.datafilesdir + datafile[0], 'utf-8');
                const data = Array.from(JSON.parse(modeldata));
                const tableName = datafile[1].toLowerCase();

                // console.log(data[0]);
                // console.log(tableName);
                

                if (data.length > 0) {

                    function createValueIds() {
                        let ids = '';
                        for(let i = 0; i < Object.keys(data[0]).length; i++){
                            ids += i === 0 ? '$1' : `,$${i+1}`;
                        }
                        return ids;
                    }
                try{
                    let i;
                    for(i = 0; i < data.length; i++) {
                        console.log('INSERTTTTTTTTTTTTTT');
                        
                        const insert_query = await kwilDB.preparedStatement(`INSERT INTO ${tableName} VALUES (${createValueIds()})`,Object.values(data[i]), true)
                        
                        // console.log(data[i]);
                        // exit;
                    }
                    spinner.succeed('Inserted ' + data.length + ' rows into the ' + tableName + ' table');
                }
                    catch(e){
                        console.log(e);
                    }
                }
                counter += 1;
            }
            if (counter === this.modelschemas.size) {
                console.log('\n');
                spinner.succeed('Complete! Dumped into KwilDB. Empty MySQL schemas were ignored.');
                // try {
                //     const files = fs.readdirSync(this.datafilesdir);
                //     if (files.length) {
                //         for await (const file of files) {
                //             fs.unlinkSync(this.datafilesdir + file);
                //         }
                //         fs.rmdirSync(this.datafilesdir);
                //     }
                // }
                // catch (e) {
                //     //
                // }
                process.exit();
            }
        }
    }
}
exports.Migrate = Migrate;
