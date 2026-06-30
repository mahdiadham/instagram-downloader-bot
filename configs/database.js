const mysql = require("mysql2");

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
}

const db = mysql.createConnection(dbConfig);

db.connect(error => {
    if (error) console.error(`Database Connection Error => ${error.stack}`);
    else console.log("Database Connected Successfully !");
});

module.exports = db;