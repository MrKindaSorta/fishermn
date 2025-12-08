/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true, error: null };
}

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') {
    return { valid: false, error: 'Display name is required' };
  }

  const trimmed = displayName.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Display name must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Display name must be 20 characters or less' };
  }

  // Allow alphanumeric, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Display name can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true, error: null };
}

/**
 * Validate registration data
 * @param {Object} data - Registration data
 * @returns {Object} {valid: boolean, errors: Object}
 */
export function validateRegistration(data) {
  const errors = {};

  // Validate email
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }

  // Validate display name
  const displayNameValidation = validateDisplayName(data.displayName);
  if (!displayNameValidation.valid) {
    errors.displayName = displayNameValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login data
 * @param {Object} data - Login data
 * @returns {Object} {valid: boolean, errors: Object}
 */
export function validateLogin(data) {
  const errors = {};

  // Validate email
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password exists
  if (!data.password || typeof data.password !== 'string' || data.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize user input (prevent XSS)
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 500); // Limit length
}

/**
 * Create standardized error response
 * @param {string} errorCode - Error code (e.g., 'INVALID_EMAIL')
 * @param {string} message - Human-readable error message
 * @param {number} status - HTTP status code
 * @returns {Response} Response object
 */
export function createErrorResponse(errorCode, message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: errorCode,
      message: message
    }),
    {
      status: status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Create standardized success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response} Response object
 */
export function createSuccessResponse(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      status: status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
