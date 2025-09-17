
import { createPool, Pool } from 'mysql2/promise';

const pool: Pool = createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'decentralized-ai-farming',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
