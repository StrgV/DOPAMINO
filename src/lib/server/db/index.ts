import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = createClient({ url: env.DATABASE_URL });

// activate WAL-mode to improve concurrency and performance
// await client.execute('PRAGMA journal_mode=WAL;');

export const db = drizzle(client, {
	schema
});
