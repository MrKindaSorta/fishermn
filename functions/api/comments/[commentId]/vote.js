/**
 * POST /api/comments/:commentId/vote
 * Vote on a comment
 */

import { createErrorResponse, createSuccessResponse } from '../../../lib/validation.js';
import { voteOnComment } from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';

export async function onRequestPost(context) {
  const { env, params, request } = context;

  try {
    const { commentId } = params;

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token, env.JWT_SECRET);
    } catch (e) {
      return createErrorResponse('UNAUTHORIZED', 'Invalid or expired token', 401);
    }

    const userId = payload.sub;

    // Parse request body
    const body = await request.json();
    const { voteType } = body;

    // Validate vote type
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return createErrorResponse('VALIDATION_ERROR', 'voteType must be "up" or "down"', 422);
    }

    // Vote on comment
    const result = await voteOnComment(env.DB, userId, commentId, voteType);

    return createSuccessResponse({
      action: result.action,
      currentVote: result.newVote,
      message: result.action === 'created' ? 'Vote recorded'
        : result.action === 'changed' ? 'Vote changed'
        : 'Vote removed'
    });

  } catch (error) {
    console.error('Error voting on comment:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to record vote', 500);
  }
}
