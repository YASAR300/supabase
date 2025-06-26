// Rate limiting utility
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier) {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const remaining = record.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  reset(identifier) {
    this.attempts.delete(identifier);
  }
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const generalRateLimiter = new RateLimiter(10, 60 * 1000); // 10 attempts per minute

// CSRF token management
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = () => {
  const token = generateCSRFToken();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
};

export const getCSRFToken = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
};

export const validateCSRFToken = (token) => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

// Content Security Policy helper
export const setSecurityHeaders = () => {
  if (typeof document !== 'undefined') {
    // Add meta tags for security
    const metaTags = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
      { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
    ];

    metaTags.forEach(({ name, 'http-equiv': httpEquiv, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }
};

// Secure random string generator
export const generateSecureRandom = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Device fingerprinting for additional security
export const getDeviceFingerprint = () => {
  if (typeof window === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

// Session timeout management
export class SessionManager {
  constructor(onTimeout, onWarning) {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    this.WARNING_DURATION = 25 * 60 * 1000; // 25 minutes
    this.onTimeout = onTimeout;
    this.onWarning = onWarning;
  }

  start() {
    this.reset();
  }

  reset() {
    this.clear();
    
    this.warningTimeoutId = setTimeout(() => {
      this.onWarning?.();
    }, this.WARNING_DURATION);

    this.timeoutId = setTimeout(() => {
      this.onTimeout?.();
    }, this.TIMEOUT_DURATION);
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }
}

// Input validation helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const containsSQLInjection = (input) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b|\bAND\b).*[=<>]/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

export const containsXSS = (input) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};