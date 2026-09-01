const sql = require('mssql');

let poolPromise;

function getPool() {
    if (!poolPromise) {
        const config = {
            server: process.env.DB_SERVER,
            port: Number(process.env.DB_PORT || 1433),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: true,
                trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        };

        poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

module.exports = { sql, getPool };
