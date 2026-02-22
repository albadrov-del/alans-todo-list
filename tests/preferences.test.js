'use strict';

const { request, app, cleanDb, closeDb, makeAgent, registerUser } = require('./helpers');

afterAll(closeDb);

// ─────────────────────────────────────────────────────────────
// GET /api/users/preferences
// ─────────────────────────────────────────────────────────────
describe('GET /api/users/preferences', () => {
  beforeEach(cleanDb);

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/users/preferences');
    expect(res.status).toBe(401);
  });

  it('returns dark_mode: false by default for a new user', async () => {
    const agent = await makeAgent();
    const res = await agent.get('/api/users/preferences');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dark_mode', false);
  });

  it('returns the saved preference after it has been updated', async () => {
    const agent = await makeAgent();
    await agent.patch('/api/users/preferences').send({ dark_mode: true });

    const res = await agent.get('/api/users/preferences');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dark_mode', true);
  });
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/users/preferences
// ─────────────────────────────────────────────────────────────
describe('PATCH /api/users/preferences', () => {
  beforeEach(cleanDb);

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .patch('/api/users/preferences')
      .send({ dark_mode: true });
    expect(res.status).toBe(401);
  });

  it('returns 400 when dark_mode is missing', async () => {
    const agent = await makeAgent();
    const res = await agent.patch('/api/users/preferences').send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when dark_mode is not a boolean', async () => {
    const agent = await makeAgent();
    const res = await agent.patch('/api/users/preferences').send({ dark_mode: 'yes' });
    expect(res.status).toBe(400);
  });

  it('sets dark_mode to true and returns the updated preference', async () => {
    const agent = await makeAgent();
    const res = await agent.patch('/api/users/preferences').send({ dark_mode: true });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dark_mode', true);
  });

  it('sets dark_mode to false and returns the updated preference', async () => {
    const agent = await makeAgent();
    // First set to true, then back to false
    await agent.patch('/api/users/preferences').send({ dark_mode: true });
    const res = await agent.patch('/api/users/preferences').send({ dark_mode: false });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dark_mode', false);
  });

  it('is idempotent — patching twice with the same value is safe', async () => {
    const agent = await makeAgent();
    await agent.patch('/api/users/preferences').send({ dark_mode: true });
    const res = await agent.patch('/api/users/preferences').send({ dark_mode: true });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dark_mode', true);
  });

  it('preferences are scoped to the user — two users have independent settings', async () => {
    const agent1 = await makeAgent();
    const agent2 = await makeAgent({
      username: 'otheruser',
      email:    'other@example.com',
    });

    await agent1.patch('/api/users/preferences').send({ dark_mode: true });

    const res1 = await agent1.get('/api/users/preferences');
    const res2 = await agent2.get('/api/users/preferences');

    expect(res1.body.dark_mode).toBe(true);
    expect(res2.body.dark_mode).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Registration auto-creates preferences row
// ─────────────────────────────────────────────────────────────
describe('Registration creates default preferences', () => {
  beforeEach(cleanDb);

  it('GET preferences succeeds immediately after registration (row exists)', async () => {
    const agent = await makeAgent();
    const res = await agent.get('/api/users/preferences');
    expect(res.status).toBe(200);
    expect(typeof res.body.dark_mode).toBe('boolean');
  });
});
