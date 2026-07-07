const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { username, password, isGuest } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    let user = userRes.rows[0];

    if (!user) {
      if (!isGuest && !password) return res.status(400).json({ error: "Password required" });
      
      const hashedPassword = (!isGuest && password) ? await bcrypt.hash(password, 10) : "";
      const insertRes = await pool.query(
        `INSERT INTO users (username, password, "isGuest", stats) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [username, hashedPassword, isGuest, { crewmate: { wins: 0 }, imposter: { wins: 0 } }]
      );
      user = insertRes.rows[0];
    } else {
      if (!user.isGuest) {
        if (!password) return res.status(401).json({ error: "Password missing" });
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) return res.status(401).json({ error: "Incorrect password" });
      }
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: "Auth failed" }); 
  }
});


module.exports = router;
