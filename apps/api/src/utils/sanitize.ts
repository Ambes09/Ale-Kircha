export function sanitizeResponse(data: any): any {
  if (!data) return data;
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'pin', 'otp', 'cvv'];
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeResponse(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeResponse(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return data;
}
