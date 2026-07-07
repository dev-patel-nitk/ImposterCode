const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); 
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT username, avatar FROM users WHERE username ILIKE $1 AND "isGuest" = false LIMIT 5`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, avatar, "preferredLanguage", rank, stats, xp, "isGuest" FROM users WHERE username = $1`,
      [req.params.username]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Profile fetch failed" }); }
});

router.post('/upload', upload.single('photo'), async (req, res) => {
  const { username } = req.body;
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query(`UPDATE users SET avatar = $1 WHERE username = $2`, [photoUrl, username]);
    res.json({ success: true, photoUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Assuming leaderboard goes here or in its own route file, let's keep it here.
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT username, xp, rank, stats, avatar FROM users WHERE "isGuest" = false ORDER BY xp DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Leaderboard failed" }); }
});

router.post('/add-xp', async (req, res) => {
  const { username, xpToAdd } = req.body;
  if (!username || !xpToAdd) return res.status(400).json({ error: "Missing fields" });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // FOR UPDATE locks the row, preventing race conditions by queuing concurrent requests
    const userRes = await client.query('SELECT xp FROM users WHERE username = $1 FOR UPDATE', [username]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "User not found" });
    }

    const currentXp = userRes.rows[0].xp;
    const newXp = currentXp + parseInt(xpToAdd);

    await client.query('UPDATE users SET xp = $1 WHERE username = $2', [newXp, username]);
    await client.query('COMMIT');
    
    res.json({ success: true, newXp });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    client.release();
  }
});

module.exports = router;
