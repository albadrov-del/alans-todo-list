'use strict';

const express     = require('express');
const router      = express.Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// ── GET /api/users/preferences ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT dark_mode FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );

    // Row is created on register; fall back to false if somehow missing
    const dark_mode = result.rows[0] ? result.rows[0].dark_mode : false;
    return res.status(200).json({ dark_mode });
  } catch (err) {
    console.error('GET preferences error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

// ── PATCH /api/users/preferences ─────────────────────────────
router.patch('/', async (req, res) => {
  const { dark_mode } = req.body;

  if (typeof dark_mode !== 'boolean') {
    return res.status(400).json({ error: 'dark_mode must be a boolean.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, dark_mode, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET dark_mode = $2, updated_at = NOW()
       RETURNING dark_mode`,
      [req.user.id, dark_mode]
    );
    return res.status(200).json({ dark_mode: result.rows[0].dark_mode });
  } catch (err) {
    console.error('PATCH preferences error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

module.exports = router;
