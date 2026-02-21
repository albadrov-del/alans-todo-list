'use strict';

const { request, app, cleanDb, closeDb, makeAgent } = require('./helpers');

afterAll(closeDb);

// Each describe block gets two fresh users: agentA and agentB
let agentA, agentB;

beforeEach(async () => {
  await cleanDb();
  agentA = await makeAgent({ username: 'userA', email: 'a@example.com' });
  agentB = await makeAgent({ username: 'userB', email: 'b@example.com', password: 'password456' });
});

// ─────────────────────────────────────────────────────────────
// GET /api/panels
// ─────────────────────────────────────────────────────────────
describe('GET /api/panels', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/panels');
    expect(res.status).toBe(401);
  });

  it('returns an empty array for a brand-new user', async () => {
    const res = await agentA.get('/api/panels');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only the authenticated user's own panels", async () => {
    await agentA.post('/api/panels').send({ panel_name: "Alan's list" });
    await agentB.post('/api/panels').send({ panel_name: "Bob's list" });

    const resA = await agentA.get('/api/panels');
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].panel_name).toBe("Alan's list");

    const resB = await agentB.get('/api/panels');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].panel_name).toBe("Bob's list");
  });

  it('returns panels ordered by panel_order ascending', async () => {
    await agentA.post('/api/panels').send({ panel_name: 'First' });
    await agentA.post('/api/panels').send({ panel_name: 'Second' });
    await agentA.post('/api/panels').send({ panel_name: 'Third' });

    const res = await agentA.get('/api/panels');
    const names = res.body.map(p => p.panel_name);
    expect(names).toEqual(['First', 'Second', 'Third']);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/panels
// ─────────────────────────────────────────────────────────────
describe('POST /api/panels', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/panels').send({ panel_name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('returns 201 with the new panel data', async () => {
    const res = await agentA.post('/api/panels').send({ panel_name: 'My list' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.panel_name).toBe('My list');
    expect(res.body.panel_order).toBe(0);
  });

  it('increments panel_order for each new panel', async () => {
    const r1 = await agentA.post('/api/panels').send({ panel_name: 'One' });
    const r2 = await agentA.post('/api/panels').send({ panel_name: 'Two' });
    expect(r1.body.panel_order).toBe(0);
    expect(r2.body.panel_order).toBe(1);
  });

  it('uses a default name when panel_name is omitted', async () => {
    const res = await agentA.post('/api/panels').send({});
    expect(res.status).toBe(201);
    expect(res.body.panel_name).toBe('To Do List');
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /api/panels/:id
// ─────────────────────────────────────────────────────────────
describe('PUT /api/panels/:id', () => {
  let panelId;

  beforeEach(async () => {
    const res = await agentA.post('/api/panels').send({ panel_name: 'My list' });
    panelId = res.body.id;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).put(`/api/panels/${panelId}`).send({ content: {} });
    expect(res.status).toBe(401);
  });

  it('updates content and returns the updated panel', async () => {
    const delta = { ops: [{ insert: 'Hello world\n' }] };
    const res = await agentA.put(`/api/panels/${panelId}`).send({ content: delta });
    expect(res.status).toBe(200);
    expect(res.body.content).toEqual(delta);
  });

  it('updates panel_name', async () => {
    const res = await agentA.put(`/api/panels/${panelId}`).send({ panel_name: 'Renamed' });
    expect(res.status).toBe(200);
    expect(res.body.panel_name).toBe('Renamed');
  });

  it('returns 404 for a non-existent panel', async () => {
    const res = await agentA.put('/api/panels/99999').send({ content: {} });
    expect(res.status).toBe(404);
  });

  it("returns 404 when user B tries to update user A's panel", async () => {
    const delta = { ops: [{ insert: 'Hacked\n' }] };
    const res = await agentB.put(`/api/panels/${panelId}`).send({ content: delta });
    expect(res.status).toBe(404); // not 403 — we don't reveal the panel exists
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/panels/:id
// ─────────────────────────────────────────────────────────────
describe('DELETE /api/panels/:id', () => {
  let panelId;

  beforeEach(async () => {
    const res = await agentA.post('/api/panels').send({ panel_name: 'My list' });
    panelId = res.body.id;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete(`/api/panels/${panelId}`);
    expect(res.status).toBe(401);
  });

  it('deletes the panel and returns 204', async () => {
    const res = await agentA.delete(`/api/panels/${panelId}`);
    expect(res.status).toBe(204);

    const panels = await agentA.get('/api/panels');
    expect(panels.body).toHaveLength(0);
  });

  it('returns 404 for a non-existent panel', async () => {
    const res = await agentA.delete('/api/panels/99999');
    expect(res.status).toBe(404);
  });

  it("returns 404 when user B tries to delete user A's panel", async () => {
    const res = await agentB.delete(`/api/panels/${panelId}`);
    expect(res.status).toBe(404);

    // Verify panel still exists for user A
    const panels = await agentA.get('/api/panels');
    expect(panels.body).toHaveLength(1);
  });
});
