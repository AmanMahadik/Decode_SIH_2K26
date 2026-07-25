import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://janadmin:Aman%402006@jansahayak-db.postgres.database.azure.com:5432/postgres?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed Azure DB query', { text: text.substring(0, 60), duration, rows: res.rowCount });
    return res;
  } catch (err: any) {
    console.error('Azure DB Query Error:', err);
    throw err;
  }
}

export async function initDatabase() {
  try {
    // 1. Vector extension
    await query('CREATE EXTENSION IF NOT EXISTS vector;');

    // 2. Schemes Table
    await query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id VARCHAR(50) PRIMARY KEY,
        title_en TEXT NOT NULL,
        title_hi TEXT,
        title_mr TEXT,
        category VARCHAR(100),
        eligibility_en TEXT,
        eligibility_hi TEXT,
        eligibility_mr TEXT,
        summary_en TEXT,
        summary_hi TEXT,
        summary_mr TEXT,
        official_link TEXT,
        benefit_amount TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Scheme Vector Chunks Table
    await query(`
      CREATE TABLE IF NOT EXISTS scheme_chunks (
        id SERIAL PRIMARY KEY,
        scheme_id VARCHAR(50) REFERENCES schemes(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        chunk_text TEXT NOT NULL,
        embedding vector(768),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Chat Logs Table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        source_scheme VARCHAR(100),
        confidence_score FLOAT DEFAULT 1.0,
        is_knowledge_gap BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Citizen Feedback Table
    await query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        answer TEXT,
        source_scheme VARCHAR(100),
        rating VARCHAR(10) NOT NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Azure Database tables initialized successfully.');
  } catch (err) {
    console.warn('Azure DB init warning (using offline fallback if unreachable):', err);
  }
}

// Initializer execution
initDatabase().catch(console.error);
