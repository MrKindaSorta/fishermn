/**
 * Cloudflare Pages Functions Middleware
 * Handles authentication for protected API routes
 */

import { extractToken, verifyToken } from './lib/auth.js';
import { createErrorResponse } from './lib/validation.js';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/lakes',
  '/api/lake-detail',
  '/api/lake-tabs',
  '/api/search-lakes'
];

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Skip auth for non-API routes (static files)
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // Skip auth for public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => url.pathname.startsWith(route));
  if (isPublicRoute) {
    return next();
  }

  // Extract token from request
  const token = extractToken(request);

  if (!token) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Verify JWT token
  const decoded = await verifyToken(token, env.JWT_SECRET);

  if (!decoded) {
    return createErrorResponse('INVALID_TOKEN', 'Invalid or expired token', 401);
  }

  // Attach user info to context for use in route handlers
  context.data = context.data || {};
  context.data.user = decoded;

  // Continue to route handler
  return next();
}
