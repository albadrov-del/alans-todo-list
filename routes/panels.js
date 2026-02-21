const express     = require('express');
const router      = express.Router();
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

// All panel routes require a valid session
router.use(requireAuth);

// ── GET /api/panels ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, panel_order, panel_name, content FROM todo_panels WHERE user_id = $1 ORDER BY panel_order ASC',
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get panels error:', err);
    return res.status(500).json({ error: 'Failed to load panels.' });
  }
});

// ── POST /api/panels ──────────────────────────────────────────
router.post('/', async (req, res) => {
  const { panel_name, content } = req.body;

  try {
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(panel_order), -1) + 1 AS next_order FROM todo_panels WHERE user_id = $1',
      [req.user.id]
    );
    const nextOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO todo_panels (user_id, panel_order, panel_name, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, panel_order, panel_name, content`,
      [req.user.id, nextOrder, panel_name || 'To Do List', content ? JSON.stringify(content) : null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create panel error:', err);
    return res.status(500).json({ error: 'Failed to create panel.' });
  }
});

// ── PUT /api/panels/:id ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id }                  = req.params;
  const { panel_name, content } = req.body;

  try {
    const result = await pool.query(
      `UPDATE todo_panels
       SET panel_name = COALESCE($1, panel_name),
           content    = COALESCE($2::jsonb, content),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, panel_order, panel_name, content`,
      [panel_name || null, content ? JSON.stringify(content) : null, id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Panel not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update panel error:', err);
    return res.status(500).json({ error: 'Failed to update panel.' });
  }
});

// ── DELETE /api/panels/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM todo_panels WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Panel not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Delete panel error:', err);
    return res.status(500).json({ error: 'Failed to delete panel.' });
  }
});

module.exports = router;
