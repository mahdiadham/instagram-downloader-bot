import mysql, { type PoolOptions, type Pool } from "mysql2/promise";

const getEnvVar = (key: string): string => {
    const value = process.env[key];

    if (!value) throw new Error(`Missing required environment variable: ${key}`);

    return value;
};

const dbConfig: PoolOptions = {
    user: getEnvVar("DB_USERNAME"),
    host: getEnvVar("DB_HOST"),
    password: getEnvVar("DB_PASSWORD"),
    port: Number(getEnvVar("DB_PORT")),
    database: getEnvVar("DB_NAME"),
    waitForConnections: true,
    connectionLimit: 10
};

const db: Pool = mysql.createPool(dbConfig);

try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully.");
    connection.release();
} catch (error) {
    console.error("❌ Failed to connect to database.");
    console.error(error);
    process.exit(1);
}

export default db;