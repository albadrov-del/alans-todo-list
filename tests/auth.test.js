'use strict';

const { request, app, cleanDb, closeDb, registerUser, loginUser, DEFAULT_USER } = require('./helpers');

afterAll(closeDb);

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(cleanDb);

  it('returns 201 and a success message for valid data', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
  });

  it('returns 400 when username is missing', async () => {
    const res = await registerUser({ username: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await registerUser({ email: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await registerUser({ password: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await registerUser({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await registerUser({ password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when username is shorter than 2 characters', async () => {
    const res = await registerUser({ username: 'x' });
    expect(res.status).toBe(400);
  });

  it('returns 409 and mentions "email" when email is already registered', async () => {
    await registerUser();
    const res = await registerUser({ username: 'otheruser' }); // same email
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 409 and mentions "username" when username is already taken', async () => {
    await registerUser();
    const res = await registerUser({ email: 'other@example.com' }); // same username
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await cleanDb();
    await registerUser();
  });

  it('returns 200 and sets a token cookie on valid credentials', async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=/);
    expect(res.body.username).toBe(DEFAULT_USER.username);
  });

  it('returns 401 for a wrong password', async () => {
    const res = await loginUser({ password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('returns 401 for an unknown email', async () => {
    const res = await loginUser({ email: 'nobody@example.com' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('uses the same error message for wrong password and unknown email (no enumeration)', async () => {
    const wrongPw  = await loginUser({ password: 'wrongpassword' });
    const wrongEmail = await loginUser({ email: 'nobody@example.com' });
    expect(wrongPw.body.error).toBe(wrongEmail.body.error);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: DEFAULT_USER.email });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'];
    expect(cookie).toBeDefined();
    // Cookie should be expired/empty
    expect(cookie[0]).toMatch(/token=;|token=(?:;|$)/);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  beforeEach(cleanDb);

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns user info when authenticated', async () => {
    await registerUser();
    const agent = require('supertest').agent(app);
    await agent.post('/api/auth/login').send({
      email: DEFAULT_USER.email, password: DEFAULT_USER.password,
    });

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(DEFAULT_USER.username);
    expect(res.body.email).toBe(DEFAULT_USER.email);
    expect(res.body.password_hash).toBeUndefined(); // never expose the hash
  });
});
