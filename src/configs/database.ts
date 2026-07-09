import mysql, { type ConnectionOptions } from "mysql2";

const getEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

const dbConfig: ConnectionOptions = {
    user: getEnvVar("DB_USERNAME"),
    host: getEnvVar("DB_HOST"),
    password: getEnvVar("DB_PASSWORD"),
    port: Number(getEnvVar("DB_PORT")),
    database: getEnvVar("DB_NAME")
};

const db = mysql.createConnection(dbConfig);

db.connect(error => {
    if (error) console.error(`Database Connection Error => ${error.stack}`);
    else console.log("Database Connected Successfully !");
});

export default db;