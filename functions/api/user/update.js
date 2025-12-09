/**
 * PUT /api/user/update
 * Update user profile information
 * Requires authentication
 */

import { updateUserProfile, formatUserForResponse } from '../../lib/db.js';
import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';

export async function onRequestPut(context) {
  const { request, env } = context;

  try {
    // User ID is attached by middleware after token verification
    const userId = context.data?.user?.sub;

    if (!userId) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    // Parse request body
    const body = await request.json();
    const { displayName } = body;

    // Validate display name
    if (!displayName || typeof displayName !== 'string') {
      return createErrorResponse('VALIDATION_ERROR', 'Display name is required', 400);
    }

    if (displayName.trim().length === 0) {
      return createErrorResponse('VALIDATION_ERROR', 'Display name cannot be empty', 400);
    }

    if (displayName.length > 100) {
      return createErrorResponse('VALIDATION_ERROR', 'Display name must be 100 characters or less', 400);
    }

    // Update user profile
    const updatedUser = await updateUserProfile(env.DB, userId, { displayName: displayName.trim() });

    if (!updatedUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Format user for response
    const userResponse = formatUserForResponse(updatedUser);

    return createSuccessResponse({
      user: userResponse,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return createErrorResponse('SERVER_ERROR', 'An error occurred while updating profile', 500);
  }
}
