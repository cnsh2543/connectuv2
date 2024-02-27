const mysql = require('mysql');
require("dotenv").config();

// Database connection configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Log when a new connection is made in the pool
pool.on('connection', () => {
    console.log('New connection created in the pool');
});

// Log errors related to the pool
pool.on('error', err => {
    console.error('Pool error:', err);
});

module.exports = pool;
