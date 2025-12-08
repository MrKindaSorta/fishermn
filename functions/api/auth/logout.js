/**
 * POST /api/auth/logout
 * User logout endpoint
 */

import { clearAuthCookie } from '../../lib/auth.js';
import { createSuccessResponse } from '../../lib/validation.js';

export async function onRequestPost(context) {
  // Create success response
  const response = createSuccessResponse({
    message: 'Logged out successfully'
  });

  // Clear auth cookie
  response.headers.set('Set-Cookie', clearAuthCookie());

  return response;
}
