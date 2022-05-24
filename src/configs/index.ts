export interface IMysqlConfig {
    mysqlusername: string;
    mysqlhost: string;
    mysqlpassword: string;
    mysqldatabase: string;
}


export function mysqlConfig(options?: IMysqlConfig): string {
    try {
        return `mysql://${options.mysqlusername.trim()}:${options.mysqlpassword.trim()}@${options.mysqlhost.trim()}:3306/${options.mysqldatabase.trim()}?connectionLimit=10&dateStrings=true`;
    } catch (e) {
        return process.exit();
    }
}

export * from './mysqlconf';
