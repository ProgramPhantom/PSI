import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from './db.js';
import { Pool } from 'pg';
import config from '../config/config.js';

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: config.connectionString,
    }),
  }),
});