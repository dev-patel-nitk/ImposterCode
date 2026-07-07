require('dotenv').config({ path: '../.env' });
const { pool, initDb } = require('../db');
const questions = require('../questions');

async function seed() {
  await initDb();
  
  const { rows } = await pool.query('SELECT COUNT(*) FROM questions');
  if (parseInt(rows[0].count) > 0) {
    console.log('✅ Questions already seeded. Skipping.');
    process.exit(0);
  }

  console.log(`Seeding ${questions.length} questions into PostgreSQL...`);
  
  for (const q of questions) {
    const mongo_id = q._id ? q._id.$oid : null;
    await pool.query(`
      INSERT INTO questions (mongo_id, title, difficulty, description, constraints, "sampleInput", "sampleOutput", "testCases", tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      mongo_id,
      q.title,
      q.difficulty,
      q.description,
      JSON.stringify(q.constraints),
      q.sampleInput,
      q.sampleOutput,
      JSON.stringify(q.testCases),
      JSON.stringify(q.tags)
    ]);
  }
  
  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
