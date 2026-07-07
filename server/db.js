const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL || 'postgresql://localhost:5432/imposter_code',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database table if it doesn't exist
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      "isGuest" BOOLEAN DEFAULT false,
      avatar VARCHAR(255) DEFAULT 'default-avatar.png',
      "preferredLanguage" VARCHAR(50) DEFAULT 'C++',
      rank VARCHAR(50) DEFAULT 'RECRUIT',
      stats JSONB DEFAULT '{"crewmate": {"wins": 0}, "imposter": {"wins": 0}}'::jsonb,
      xp INTEGER DEFAULT 0,
      "googleId" VARCHAR(255) UNIQUE,
      email VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      mongo_id VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      difficulty VARCHAR(50),
      description TEXT,
      constraints JSONB,
      "sampleInput" TEXT,
      "sampleOutput" TEXT,
      "testCases" JSONB,
      tags JSONB
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ PostgreSQL: users table initialized successfully');
  } catch (err) {
    console.error('❌ PostgreSQL Initialization Error:', err);
  }
};

module.exports = {
  pool,
  initDb,
};
