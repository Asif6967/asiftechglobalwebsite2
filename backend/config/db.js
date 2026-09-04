const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.resolve(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'asiftech.db');
console.log(`[Database] Initializing SQLite database at: ${dbPath}`);

const sqlite = new DatabaseSync(dbPath);

// Enable WAL mode for performance & concurrent reads
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables from schema.sql
const schemaPath = path.join(dbDir, 'schema.sql');
if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqlite.exec(schemaSql);
    console.log('[Database] Schema verified and tables ensured.');
}

// Seed initial Admin and Demo data if not present
function initializeSeedData() {
    try {
        // Check if admin exists
        const adminEmail = process.env.ADMIN_EMAIL || 'AsifTechGlobal696788@gmail.com';
        const adminCheckStmt = sqlite.prepare('SELECT id FROM admins WHERE email = ?');
        const existingAdmin = adminCheckStmt.get(adminEmail);

        if (!existingAdmin) {
            const adminName = process.env.ADMIN_NAME || 'Asif Tech Global Admin';
            const adminPass = process.env.ADMIN_PASSWORD || 'Admin@AsifTech2026';
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(adminPass, salt);

            const insertAdmin = sqlite.prepare(`
                INSERT INTO admins (name, email, password_hash, role)
                VALUES (?, ?, ?, 'superadmin')
            `);
            insertAdmin.run(adminName, adminEmail, passwordHash);
            console.log(`[Database] Default Admin created: ${adminEmail}`);
        }

        // Seed idempotently so new CMS tables receive demo content on existing installs.
        const seedPath = path.join(dbDir, 'seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            sqlite.exec(seedSql);
            console.log('[Database] Seed data verified successfully.');
        }
    } catch (err) {
        console.error('[Database Seed Error]:', err.message);
    }
}

initializeSeedData();

// Helper wrapper functions
const db = {
    all: (sql, params = []) => {
        const stmt = sqlite.prepare(sql);
        return stmt.all(...params);
    },
    get: (sql, params = []) => {
        const stmt = sqlite.prepare(sql);
        return stmt.get(...params);
    },
    run: (sql, params = []) => {
        const stmt = sqlite.prepare(sql);
        return stmt.run(...params);
    },
    exec: (sql) => {
        return sqlite.exec(sql);
    }
};

module.exports = db;
