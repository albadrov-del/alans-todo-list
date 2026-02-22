'use strict';

const fs   = require('fs');
const path = require('path');
const app  = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 3000;

// Run setup.sql on startup — CREATE TABLE IF NOT EXISTS makes this idempotent
async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database migration complete.');
}

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed — server not started:', err);
    process.exit(1);
  });
