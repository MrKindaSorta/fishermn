/**
 * GET /api/auth/me
 * Get current user information
 * Requires authentication (middleware will verify token)
 */

import { findUserById, formatUserForResponse } from '../../lib/db.js';
import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // User ID is attached by middleware after token verification
    const userId = context.data?.user?.sub;

    if (!userId) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    // Fetch user from database
    const user = await findUserById(env.DB, userId);

    if (!user) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Format user for response
    const userResponse = formatUserForResponse(user);

    return createSuccessResponse({
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse('SERVER_ERROR', 'An error occurred while fetching user data', 500);
  }
}
