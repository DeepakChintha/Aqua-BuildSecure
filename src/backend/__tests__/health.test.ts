import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Health & Supabase Integration Endpoints', () => {
  it('GET /health returns HTTP 200 with service health and Supabase status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('Clinexa Backend');
    expect(res.body.status).toBe('healthy');
    expect(res.body.services).toBeDefined();
    expect(res.body.services.supabase).toBeDefined();
    expect(res.body.services.supabase.status).toBeDefined();
  });

  it('GET /api/v1/health returns HTTP 200 with service health and Supabase status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('Clinexa Backend');
    expect(res.body.status).toBe('healthy');
    expect(res.body.services).toBeDefined();
    expect(res.body.services.supabase).toBeDefined();
  });

  it('GET unknown route returns HTTP 404 with standard JSON error response', async () => {
    const res = await request(app).get('/api/v1/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/v1/this-route-does-not-exist',
      },
    });
    expect(res.body.error.stack).toBeUndefined();
  });

  it('POST with malformed JSON body returns HTTP 400 or handled safely', async () => {
    const res = await request(app)
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{ malformed json');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
