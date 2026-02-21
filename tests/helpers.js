'use strict';

const request = require('supertest');
const app     = require('../app');
const pool    = require('../db');

// ── DB helpers ────────────────────────────────────────────────

/**
 * Wipe all rows between tests.
 * CASCADE handles todo_panels via the FK constraint.
 */
async function cleanDb() {
  await pool.query('TRUNCATE users, todo_panels RESTART IDENTITY CASCADE');
}

/**
 * Close the pg pool so Jest exits cleanly.
 * Call in afterAll() of each test file.
 */
async function closeDb() {
  await pool.end();
}

// ── Auth helpers ──────────────────────────────────────────────

const DEFAULT_USER = {
  username: 'testuser',
  email:    'test@example.com',
  password: 'password123',
};

/** POST /api/auth/register */
function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...DEFAULT_USER, ...overrides });
}

/** POST /api/auth/login */
function loginUser(overrides = {}) {
  return request(app)
    .post('/api/auth/login')
    .send({
      email:    overrides.email    || DEFAULT_USER.email,
      password: overrides.password || DEFAULT_USER.password,
    });
}

/**
 * Register + login a user and return a supertest agent that
 * carries the JWT cookie automatically on every request.
 */
async function makeAgent(overrides = {}) {
  await registerUser(overrides);
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({
    email:    overrides.email    || DEFAULT_USER.email,
    password: overrides.password || DEFAULT_USER.password,
  });
  return agent;
}

module.exports = {
  request,
  app,
  pool,
  cleanDb,
  closeDb,
  registerUser,
  loginUser,
  makeAgent,
  DEFAULT_USER,
};
