const mysql = require('mysql2');

require('dotenv').config();
let db_user = process.env.DB_USER;
let db_pw = process.env.DB_PASSWORD;

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: db_user,
        password: db_pw,
        database: 'election'
    },
    console.log('Connected to the election database.')
)

module.exports = db;