import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://vivekmohanraj:vivekmohanraj@localhost:5432/sentinel_db',
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

export default pool;
