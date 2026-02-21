'use strict';

const { Pool } = require('pg');
require('dotenv').config();

// Direct DB connection for E2E setup/teardown
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

async function cleanDb() {
  await pool.query('TRUNCATE users, todo_panels RESTART IDENTITY CASCADE');
}

async function closeDb() {
  await pool.end();
}

/**
 * Register a user via the API (bypasses the UI for speed).
 */
async function apiRegister(request, data = {}) {
  const defaults = { username: 'e2euser', email: 'e2e@example.com', password: 'password123' };
  await request.post('http://localhost:3001/api/auth/register', {
    data: { ...defaults, ...data },
  });
}

module.exports = { cleanDb, closeDb, apiRegister };
