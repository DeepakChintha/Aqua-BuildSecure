import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter: Applies across all API endpoints.
 * Limit: 100 requests per 15 minutes per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});

/**
 * Strict Auth Rate Limiter: Applied to sensitive authentication endpoints (signin, signup).
 * Limit: 10 requests per 15 minutes per IP to prevent brute-force attacks.
 */
export const sensitiveAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

/**
 * Strict Medical Records Rate Limiter: Applied to sensitive clinical data endpoints.
 * Limit: 30 requests per 15 minutes per IP.
 */
export const sensitiveMedicalRecordsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded for clinical medical records. Please try again later.',
    },
  },
});

/**
 * Strict Admin Rate Limiter: Applied to sensitive administrative endpoints.
 * Limit: 30 requests per 15 minutes per IP.
 */
export const sensitiveAdminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded for administrative operations.',
    },
  },
});
