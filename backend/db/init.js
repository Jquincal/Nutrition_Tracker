import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from './database.js';

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
await pool.query(schema);
console.log('PostgreSQL schema initialized');
await pool.end();
