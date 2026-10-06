import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';
import {
  recordAuditLog,
  getAuditLogs,
  clearAuditLogs,
  sanitizeAuditMetadata,
  AuditAction,
} from '../utils/auditLogger.js';
import { SecurityDetector } from '../services/securityDetector.service.js';

describe('Phase 9 — CLINEXA Security & Audit Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAuditLogs();
    SecurityDetector.resetState();
  });

  const mockAuthenticatedUser = (userObj: {
    id: string;
    email: string;
    role: string;
    patient_id?: string;
    doctor_id?: string;
    user_metadata?: Record<string, unknown>;
  }) => {
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: userObj.id,
              email: userObj.email,
              role: userObj.role,
              patient_id: userObj.patient_id,
              doctor_id: userObj.doctor_id,
              user_metadata: userObj.user_metadata || { role: userObj.role },
            },
          },
          error: null,
        }),
      },
    };
    vi.spyOn(supabaseConfig, 'getSupabaseClient').mockReturnValue(mockSupabaseClient as any);
  };

  describe('Audit Logging System', () => {
    it('should record all required audit actions correctly', () => {
      const actions: AuditAction[] = [
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'LOGOUT',
        'PROFILE_UPDATED',
        'APPOINTMENT_CREATED',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_CANCELLED',
        'APPOINTMENT_COMPLETED',
        'MEDICAL_RECORD_VIEWED',
        'MEDICAL_RECORD_CREATED',
        'MEDICAL_RECORD_UPDATED',
        'UNAUTHORIZED_ACCESS',
        'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        'DOCTOR_APPROVED',
        'DOCTOR_SUSPENDED',
        'ADMIN_ACTION',
      ];

      actions.forEach((action) => {
        recordAuditLog({
          user_id: 'usr-test-123',
          action,
          resource_type: 'test_resource',
          resource_id: 'res-test-456',
          result: 'success',
          ip: '127.0.0.1',
          user_agent: 'Vitest-Test-Agent',
        });
      });

      const logs = getAuditLogs();
      expect(logs).toHaveLength(actions.length);
      logs.forEach((log, index) => {
        expect(log.action).toBe(actions[index]);
        expect(log.user_id).toBe('usr-test-123');
        expect(log.result).toBe('success');
        expect(log.ip_address).toBe('127.0.0.1');
        expect(log.user_agent).toBe('Vitest-Test-Agent');
        expect(log.timestamp).toBeDefined();
      });
    });

    it('should recursively sanitize sensitive keys in metadata (never store passwords, tokens, secrets)', () => {
      const sensitiveMetadata = {
        password: 'SuperSecretPassword123!',
        access_token: 'bearer_token_xyz',
        refresh_token: 'refresh_token_abc',
        secret: 'my-api-secret',
        ssn: '123-45-6789',
        raw_notes: 'Highly sensitive unencrypted medical note',
        nested: {
          password: 'NestedPassword!',
          safeField: 'This should remain untouched',
        },
        safeData: 'John Doe',
      };

      const sanitized = sanitizeAuditMetadata(sensitiveMetadata);

      expect(sanitized.password).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.access_token).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.refresh_token).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.secret).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.ssn).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.raw_notes).toBe('[REDACTED_SENSITIVE_DATA]');
      expect((sanitized.nested as any).password).toBe('[REDACTED_SENSITIVE_DATA]');
      expect((sanitized.nested as any).safeField).toBe('This should remain untouched');
      expect(sanitized.safeData).toBe('John Doe');
    });

    it('should record audit log when auditing endpoints via HTTP requests', async () => {
      mockAuthenticatedUser({
        id: 'admin-001',
        email: 'admin@clinexa.com',
        role: 'admin',
      });

      const response = await request(app)
        .patch('/api/v1/admin/doctors/doc-10000000-0000-0000-0000-000000000001/status')
        .set('Authorization', 'Bearer valid-admin-jwt-token')
        .send({ status: 'approved' });

      expect(response.status).toBe(200);

      const logs = getAuditLogs();
      const doctorApprovedLog = logs.find((l) => l.action === 'DOCTOR_APPROVED');
      const adminActionLog = logs.find((l) => l.action === 'ADMIN_ACTION');

      expect(doctorApprovedLog).toBeDefined();
      expect(doctorApprovedLog?.user_id).toBe('admin-001');
      expect(adminActionLog).toBeDefined();
    });
  });

  describe('Security Threat Event Detector', () => {
    it('should detect repeated failed authentication attempts deterministically', () => {
      const identifier = 'attacker@malicious.com';
      const ip = '192.168.1.100';

      let threat = SecurityDetector.trackFailedAuth(identifier, ip);
      expect(threat).toBeNull();

      threat = SecurityDetector.trackFailedAuth(identifier, ip);
      expect(threat).toBeNull();

      // 3rd failed attempt triggers threat event
      threat = SecurityDetector.trackFailedAuth(identifier, ip);
      expect(threat).not.toBeNull();
      expect(threat?.event_type).toBe('REPEATED_FAILED_AUTH');
      expect(threat?.severity).toBe('HIGH');

      const activeThreats = SecurityDetector.getActiveThreatEvents();
      expect(activeThreats).toHaveLength(1);
      expect(activeThreats[0].details.identifier).toBe(identifier);
    });

    it('should detect repeated unauthorized access attempts deterministically', () => {
      const userId = 'usr-bad-actor';
      const ip = '10.0.0.50';

      SecurityDetector.trackUnauthorizedAccess(userId, ip, '/api/v1/medical-records/rec-secret');
      SecurityDetector.trackUnauthorizedAccess(userId, ip, '/api/v1/admin/doctors');

      const threat = SecurityDetector.trackUnauthorizedAccess(userId, ip, '/api/v1/patient/profile/other');

      expect(threat).not.toBeNull();
      expect(threat?.event_type).toBe('REPEATED_UNAUTHORIZED_ACCESS');
      expect(threat?.severity).toBe('CRITICAL');
    });

    it('should detect suspicious admin operations deterministically', () => {
      const adminId = 'admin-suspicious';
      const ip = '172.16.0.1';

      const threat = SecurityDetector.trackSuspiciousAdminOp(adminId, ip, 'MASS_EXPORT_ATTEMPT');

      expect(threat).not.toBeNull();
      expect(threat?.event_type).toBe('SUSPICIOUS_ADMIN_OPERATION');
      expect(threat?.severity).toBe('CRITICAL');
    });
  });

  describe('Security Headers & Helmet Audit', () => {
    it('should set essential security headers on HTTP responses', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });
  });
});
