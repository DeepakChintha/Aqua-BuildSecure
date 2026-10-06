import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';

describe('Phase 4 Supabase JWT Authentication & Auth Middleware', () => {
  it('GET /api/v1/auth/me without Authorization header returns HTTP 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toContain('missing');
  });

  it('GET /api/v1/auth/me with malformed Authorization header returns HTTP 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toContain('Format must be: Bearer <token>');
  });

  it('GET /api/v1/auth/me with invalid JWT token returns HTTP 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-jwt-token-string');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me with valid verified JWT returns HTTP 200 and user identity', async () => {
    const mockUser = {
      id: 'usr-99999999-9999-9999-9999-999999999999',
      email: 'test.user@clinexa.local',
      role: 'patient',
      user_metadata: { full_name: 'Test Patient' },
    };

    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    vi.spyOn(supabaseConfig, 'getSupabaseClient').mockReturnValue(mockSupabaseClient as any);

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer valid.mocked.jwt.token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(mockUser.id);
    expect(res.body.data.user.email).toBe(mockUser.email);
  });

  it('POST /api/v1/auth/signup validates payload correctly', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'invalid-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/signin validates payload correctly', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
