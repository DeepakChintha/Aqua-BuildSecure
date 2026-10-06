import { recordAuditLog } from '../utils/auditLogger.js';
import { logger } from '../utils/logger.js';

export interface SecurityThreatEvent {
  id: string;
  type: 'REPEATED_FAILED_AUTH' | 'REPEATED_UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ADMIN_OPERATION';
  event_type?: 'REPEATED_FAILED_AUTH' | 'REPEATED_UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ADMIN_OPERATION';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  identifier: string; // IP address or User ID
  eventCount: number;
  detectedAt: string;
  details: any;
}

const threatEventsStore: SecurityThreatEvent[] = [];

// Sliding window trackers (identifier -> timestamps array)
const failedAuthTracker = new Map<string, number[]>();
const unauthorizedTracker = new Map<string, number[]>();

const WINDOW_MS = 5 * 60 * 1000; // 5 minute sliding window
const FAILED_AUTH_THRESHOLD = 3; // 3 failed logins triggers alert
const UNAUTHORIZED_THRESHOLD = 3; // 3 forbidden/unauthorized attempts triggers alert

export class SecurityDetector {
  /**
   * Resets threat trackers for isolated tests.
   */
  static resetTrackers(): void {
    threatEventsStore.length = 0;
    failedAuthTracker.clear();
    unauthorizedTracker.clear();
  }

  static resetState(): void {
    this.resetTrackers();
  }

  /**
   * Cleans old timestamps outside the sliding window.
   */
  private static pruneWindow(timestamps: number[]): number[] {
    const now = Date.now();
    return timestamps.filter((t) => now - t <= WINDOW_MS);
  }

  /**
   * Track failed login attempt and detect brute force / credential stuffing.
   */
  static trackFailedLogin(identifier: string, ipAddress?: string): SecurityThreatEvent | null {
    const now = Date.now();
    let timestamps = failedAuthTracker.get(identifier) || [];
    timestamps = this.pruneWindow(timestamps);
    timestamps.push(now);
    failedAuthTracker.set(identifier, timestamps);

    if (timestamps.length >= FAILED_AUTH_THRESHOLD) {
      const threat: SecurityThreatEvent = {
        id: 'thr-' + Date.now(),
        type: 'REPEATED_FAILED_AUTH',
        event_type: 'REPEATED_FAILED_AUTH',
        severity: 'HIGH',
        identifier,
        eventCount: timestamps.length,
        detectedAt: new Date().toISOString(),
        details: { identifier, message: `Brute force warning: ${timestamps.length} failed login attempts detected within 5 minutes` },
      };

      threatEventsStore.push(threat);

      recordAuditLog({
        action: 'LOGIN_FAILURE',
        user_id: identifier,
        result: 'failed',
        ip_address: ipAddress,
        metadata: { alert: 'REPEATED_FAILED_AUTH', count: timestamps.length },
      });

      logger.warn({ threat }, `SECURITY THREAT DETECTED: REPEATED_FAILED_AUTH for ${identifier}`);
      return threat;
    }

    return null;
  }

  static trackFailedAuth(identifier: string, ipAddress?: string): SecurityThreatEvent | null {
    return this.trackFailedLogin(identifier, ipAddress);
  }

  /**
   * Track unauthorized / forbidden access attempt and detect privilege escalation or scanning.
   */
  static trackUnauthorizedAccess(identifier: string, ipAddress?: string, path?: string): SecurityThreatEvent | null {
    const now = Date.now();
    let timestamps = unauthorizedTracker.get(identifier) || [];
    timestamps = this.pruneWindow(timestamps);
    timestamps.push(now);
    unauthorizedTracker.set(identifier, timestamps);

    if (timestamps.length >= UNAUTHORIZED_THRESHOLD) {
      const threat: SecurityThreatEvent = {
        id: 'thr-' + Date.now(),
        type: 'REPEATED_UNAUTHORIZED_ACCESS',
        event_type: 'REPEATED_UNAUTHORIZED_ACCESS',
        severity: 'CRITICAL',
        identifier,
        eventCount: timestamps.length,
        detectedAt: new Date().toISOString(),
        details: { identifier, path, message: `Access anomaly: ${timestamps.length} unauthorized access violations detected` },
      };

      threatEventsStore.push(threat);

      recordAuditLog({
        action: 'UNAUTHORIZED_ACCESS',
        user_id: identifier,
        result: 'denied',
        ip_address: ipAddress,
        metadata: { alert: 'REPEATED_UNAUTHORIZED_ACCESS', path, count: timestamps.length },
      });

      logger.warn({ threat }, `SECURITY THREAT DETECTED: REPEATED_UNAUTHORIZED_ACCESS for ${identifier}`);
      return threat;
    }

    return null;
  }

  /**
   * Track suspicious administrative operation.
   */
  static trackAdminAction(adminUserId: string, actionName: string, targetResourceId?: string): SecurityThreatEvent {
    const threat: SecurityThreatEvent = {
      id: 'thr-' + Date.now(),
      type: 'SUSPICIOUS_ADMIN_OPERATION',
      event_type: 'SUSPICIOUS_ADMIN_OPERATION',
      severity: 'CRITICAL',
      identifier: adminUserId,
      eventCount: 1,
      detectedAt: new Date().toISOString(),
      details: { identifier: adminUserId, actionName, message: `Administrative action invoked: ${actionName}` },
    };

    threatEventsStore.push(threat);

    recordAuditLog({
      action: 'ADMIN_ACTION',
      user_id: adminUserId,
      resource_id: targetResourceId,
      result: 'success',
      metadata: { actionName },
    });

    return threat;
  }

  static trackSuspiciousAdminOp(adminUserId: string, ipAddress?: string, actionName?: string): SecurityThreatEvent {
    return this.trackAdminAction(adminUserId, actionName || 'SUSPICIOUS_ADMIN_OP', ipAddress);
  }

  /**
   * Retrieves recorded security threat events.
   */
  static getThreatEvents(): SecurityThreatEvent[] {
    return [...threatEventsStore];
  }

  static getActiveThreatEvents(): SecurityThreatEvent[] {
    return [...threatEventsStore];
  }
}

