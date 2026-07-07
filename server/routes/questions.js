const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// @route   GET /api/questions/generate
// @desc    Get a random DSA question from the database
// @access  Public
router.get('/generate', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No questions found in database." });
    }
    const problem = result.rows[0];
    res.json(problem);
  } catch (error) {
    console.error("❌ Error generating question from Postgres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
