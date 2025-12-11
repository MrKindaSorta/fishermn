/**
 * POST /api/votes/:contentType/:contentId
 * Vote on content (ice, catch, snow, update reports)
 */

import { createErrorResponse, createSuccessResponse } from '../../../lib/validation.js';
import { upsertVote } from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';

// POST - Create or update vote
export async function onRequestPost(context) {
  const { env, params, request } = context;

  try {
    const { contentType, contentId } = params;

    // Validate content type
    const validTypes = ['ice', 'catch', 'snow', 'update'];
    if (!validTypes.includes(contentType)) {
      return createErrorResponse('INVALID_REQUEST', 'Invalid content type', 400);
    }

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

    if (!payload || !payload.sub) {
      return createErrorResponse('UNAUTHORIZED', 'Invalid token', 401);
    }

    const userId = payload.sub;

    // Parse request body
    const body = await request.json();
    const { voteType } = body;

    // Validate vote type
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return createErrorResponse('VALIDATION_ERROR', 'voteType must be "up" or "down"', 422);
    }

    // Upsert vote (handles creation, update, removal)
    const result = await upsertVote(env.DB, userId, contentType, contentId, voteType);

    return createSuccessResponse({
      action: result.action,
      previousVote: result.previousVote,
      currentVote: result.newVote,
      message: result.action === 'created' ? 'Vote recorded'
        : result.action === 'changed' ? 'Vote changed'
        : 'Vote removed'
    });

  } catch (error) {
    console.error('Error voting:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to record vote', 500);
  }
}
