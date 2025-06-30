import winston from 'winston';

// Create security-specific logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cv-resumer-security' },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/security-error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined security logs
    new winston.transports.File({ 
      filename: 'logs/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security event types
export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILURE = 'REGISTER_FAILURE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_INVALID = 'TOKEN_INVALID',
  RATE_LIMIT_HIT = 'RATE_LIMIT_HIT',
  FILE_UPLOAD_SUCCESS = 'FILE_UPLOAD_SUCCESS',
  FILE_UPLOAD_FAILURE = 'FILE_UPLOAD_FAILURE',
  SUSPICIOUS_FILE = 'SUSPICIOUS_FILE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

// Security logging interface
interface SecurityLogData {
  event: SecurityEvent;
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Main security logging function
export const logSecurityEvent = (data: Omit<SecurityLogData, 'timestamp'>) => {
  const logEntry: SecurityLogData = {
    ...data,
    timestamp: new Date()
  };

  const level = getLogLevel(data.severity);
  
  securityLogger.log(level, 'Security Event', logEntry);

  // Alert for critical events
  if (data.severity === 'critical') {
    alertCriticalEvent(logEntry);
  }
};

// Convert severity to winston log level
const getLogLevel = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'error';
    case 'medium': return 'warn';
    case 'low': return 'info';
    default: return 'info';
  }
};

// Alert function for critical events (could integrate with external services)
const alertCriticalEvent = (logEntry: SecurityLogData) => {
  console.error('🚨 CRITICAL SECURITY EVENT:', logEntry);
  
  // TODO: Integrate with alerting services like:
  // - Email notifications
  // - Slack webhooks
  // - PagerDuty
  // - Discord webhooks
};

// Helper functions for specific events
export const logAuthEvent = (
  event: SecurityEvent.LOGIN_SUCCESS | SecurityEvent.LOGIN_FAILURE | SecurityEvent.REGISTER_SUCCESS | SecurityEvent.REGISTER_FAILURE,
  req: any,
  userId?: string,
  email?: string,
  error?: string
) => {
  const severity = event.includes('FAILURE') ? 'medium' : 'low';
  
  logSecurityEvent({
    event,
    userId,
    email,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    severity,
    details: error ? { error } : undefined
  });
};

export const logFileEvent = (
  event: SecurityEvent.FILE_UPLOAD_SUCCESS | SecurityEvent.FILE_UPLOAD_FAILURE | SecurityEvent.SUSPICIOUS_FILE,
  req: any,
  userId: string,
  filename?: string,
  fileSize?: number,
  error?: string
) => {
  const severity = event === SecurityEvent.SUSPICIOUS_FILE ? 'high' : 
                   event === SecurityEvent.FILE_UPLOAD_FAILURE ? 'medium' : 'low';
  
  logSecurityEvent({
    event,
    userId,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    severity,
    details: {
      filename,
      fileSize,
      error
    }
  });
};

export const logRateLimitEvent = (
  req: any,
  endpoint: string,
  limit: number
) => {
  logSecurityEvent({
    event: SecurityEvent.RATE_LIMIT_HIT,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    severity: 'medium',
    details: {
      endpoint,
      limit,
      message: 'Rate limit exceeded'
    }
  });
};

export const logUnauthorizedAccess = (
  req: any,
  reason: string,
  userId?: string
) => {
  logSecurityEvent({
    event: SecurityEvent.UNAUTHORIZED_ACCESS,
    userId,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    severity: 'high',
    details: {
      reason,
      path: req.path,
      method: req.method
    }
  });
};

export const logValidationError = (
  req: any,
  validationErrors: any,
  userId?: string
) => {
  logSecurityEvent({
    event: SecurityEvent.VALIDATION_ERROR,
    userId,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    severity: 'low',
    details: {
      validationErrors,
      path: req.path,
      method: req.method
    }
  });
};