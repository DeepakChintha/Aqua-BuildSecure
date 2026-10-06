import { logger } from './logger.js';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PROFILE_UPDATED'
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'
  | 'MEDICAL_RECORD_VIEWED'
  | 'MEDICAL_RECORD_CREATED'
  | 'MEDICAL_RECORD_UPDATED'
  | 'UNAUTHORIZED_ACCESS'
  | 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS'
  | 'DOCTOR_APPROVED'
  | 'DOCTOR_SUSPENDED'
  | 'ADMIN_ACTION';

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  userId?: string;
  action: AuditAction | string;
  resource_type?: string;
  resourceType?: string;
  resource_id?: string;
  resourceId?: string;
  result: 'success' | 'denied' | 'failed';
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface InputAuditLogEntry {
  user_id?: string;
  userId?: string;
  action: AuditAction | string;
  resource_type?: string;
  resourceType?: string;
  resource_id?: string;
  resourceId?: string;
  result: 'success' | 'denied' | 'failed' | 'failure';
  timestamp?: string;
  ip?: string;
  ip_address?: string;
  user_agent?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

const auditLogsStore: AuditLogEntry[] = [];

/**
 * Sanitizes metadata payload to ensure sensitive secrets, tokens, or raw medical text are never stored.
 */
export const sanitizeAuditMetadata = (metadata?: Record<string, unknown>): Record<string, unknown> => {
  if (!metadata) return {};

  const SENSITIVE_KEYS = new Set([
    'password',
    'pass',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'authorization',
    'cookie',
    'ssn',
    'credit_card',
    'raw_notes',
    'secret_key',
    'private_key',
  ]);

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Record an audit log entry for security, compliance, and threat detection monitoring.
 */
export const recordAuditLog = (input: InputAuditLogEntry): AuditLogEntry => {
  const normalizedResult: 'success' | 'denied' | 'failed' =
    input.result === 'failure' ? 'failed' : input.result;

  const uid = input.user_id || input.userId;
  const rType = input.resource_type || input.resourceType;
  const rId = input.resource_id || input.resourceId;

  const logEntry: AuditLogEntry = {
    id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    user_id: uid,
    userId: uid,
    action: input.action,
    resource_type: rType,
    resourceType: rType,
    resource_id: rId,
    resourceId: rId,
    result: normalizedResult,
    timestamp: input.timestamp || new Date().toISOString(),
    ip_address: input.ip_address || input.ip,
    user_agent: input.user_agent || input.userAgent,
    metadata: sanitizeAuditMetadata(input.metadata),
  };

  auditLogsStore.push(logEntry);

  if (logEntry.result === 'denied' || logEntry.result === 'failed') {
    logger.warn({ audit: logEntry }, `SECURITY AUDIT [${logEntry.result.toUpperCase()}]: ${logEntry.action}`);
  } else {
    logger.info({ audit: logEntry }, `SECURITY AUDIT [SUCCESS]: ${logEntry.action}`);
  }

  return logEntry;
};

export const getAuditLogs = (): AuditLogEntry[] => {
  return [...auditLogsStore];
};

export const clearAuditLogs = (): void => {
  auditLogsStore.length = 0;
};

