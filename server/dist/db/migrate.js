import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
async function migrate() {
    const client = await pool.connect();
    try {
        const migrationsDir = join(__dirname, 'migrations');
        const files = readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();
        for (const file of files) {
            const sql = readFileSync(join(migrationsDir, file), 'utf-8');
            console.log(`Running migration: ${file}`);
            await client.query(sql);
        }
        console.log('Migrations complete.');
    }
    finally {
        client.release();
        await pool.end();
    }
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
