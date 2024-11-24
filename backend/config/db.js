require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
// Database configuration from environment variables
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./ca.pem').toString()
    },
};

// Create connection pool
const pool = new Pool(config);

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client:', err.stack);
        return;
    }
    client.query('SELECT VERSION()', (err, result) => {
        release();
        if (err) {
            console.error('Error executing query:', err.stack);
            return;
        }
        console.log('Connected to PostgreSQL:', result.rows[0].version);
    });
});

// Error handling for the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err);
    process.exit(-1);
});

module.exports = pool;