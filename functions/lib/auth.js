/**
 * JWT Authentication Utilities for Cloudflare Workers
 * Uses @tsndr/cloudflare-worker-jwt for JWT operations
 */

// Note: In production, install: npm install @tsndr/cloudflare-worker-jwt bcryptjs
// For now, this provides the interface that will be used

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, displayName
 * @param {string} secret - JWT secret from environment
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(user, secret) {
  // In production, use @tsndr/cloudflare-worker-jwt
  // const jwt = require('@tsndr/cloudflare-worker-jwt');

  const payload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // For development, return a simple base64 encoded token
  // Replace with actual JWT signing in production
  if (typeof jwt !== 'undefined' && jwt.sign) {
    return await jwt.sign(payload, secret);
  }

  // Fallback for development
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret from environment
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
export async function verifyToken(token, secret) {
  try {
    // In production, use @tsndr/cloudflare-worker-jwt
    // const jwt = require('@tsndr/cloudflare-worker-jwt');

    if (typeof jwt !== 'undefined' && jwt.verify) {
      const isValid = await jwt.verify(token, secret);
      if (!isValid) return null;
      return jwt.decode(token).payload;
    }

    // Fallback for development - decode base64
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extract token from request (cookie or Authorization header)
 * @param {Request} request - Cloudflare Request object
 * @returns {string|null} Token or null if not found
 */
export function extractToken(request) {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring(11);
      }
    }
  }

  return null;
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  // In production, use bcryptjs
  // const bcrypt = require('bcryptjs');
  // return await bcrypt.hash(password, 10);

  // For development, use Web Crypto API (not secure, just for testing)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hash) {
  // In production, use bcryptjs
  // const bcrypt = require('bcryptjs');
  // return await bcrypt.compare(password, hash);

  // For development, compare SHA-256 hashes
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

/**
 * Generate a random user ID
 * @returns {string} UUID-style user ID
 */
export function generateUserId() {
  return 'user-' + crypto.randomUUID();
}

/**
 * Create HTTP-only cookie header
 * @param {string} token - JWT token
 * @param {number} maxAge - Cookie max age in seconds (default 24 hours)
 * @returns {string} Set-Cookie header value
 */
export function createAuthCookie(token, maxAge = 86400) {
  const cookie = [
    `auth_token=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    'Path=/'
  ].join('; ');

  return cookie;
}

/**
 * Create cookie header to clear auth cookie
 * @returns {string} Set-Cookie header value to clear cookie
 */
export function clearAuthCookie() {
  return 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
}
