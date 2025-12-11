/**
 * GET/POST /api/lakes/:slug/updates
 * Get or create general updates/comments for a lake
 */

import { createErrorResponse, createSuccessResponse, sanitizeInput } from '../../../lib/validation.js';
import {
  findLakeBySlug,
  getLakeUpdates,
  createLakeUpdate,
  formatLakeUpdateForResponse
} from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';

// GET - List updates for a lake
export async function onRequestGet(context) {
  const { env, params } = context;

  try {
    const { slug } = params;

    if (!slug) {
      return createErrorResponse('INVALID_REQUEST', 'Lake slug is required', 400);
    }

    // Find lake by slug
    const lake = await findLakeBySlug(env.DB, slug);
    if (!lake) {
      return createErrorResponse('NOT_FOUND', 'Lake not found', 404);
    }

    // Get updates
    const updates = await getLakeUpdates(env.DB, lake.id, 20);
    const formattedUpdates = updates.map(formatLakeUpdateForResponse);

    return createSuccessResponse({
      updates: formattedUpdates,
      count: formattedUpdates.length,
      lakeId: lake.id,
      lakeName: lake.name
    });

  } catch (error) {
    console.error('Error getting lake updates:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve updates', 500);
  }
}

// POST - Create a new update/comment (auth required)
export async function onRequestPost(context) {
  const { env, params, request } = context;

  try {
    const { slug } = params;

    if (!slug) {
      return createErrorResponse('INVALID_REQUEST', 'Lake slug is required', 400);
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

    // Find lake by slug
    const lake = await findLakeBySlug(env.DB, slug);
    if (!lake) {
      return createErrorResponse('NOT_FOUND', 'Lake not found', 404);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('INVALID_REQUEST', 'Invalid JSON in request body', 400);
    }

    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createErrorResponse('VALIDATION_ERROR', 'Content is required', 422);
    }

    if (content.length > 500) {
      return createErrorResponse('VALIDATION_ERROR', 'Content must be 500 characters or less', 422);
    }

    // Generate unique ID
    const updateId = `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create the update
    const update = await createLakeUpdate(env.DB, {
      id: updateId,
      lakeId: lake.id,
      userId: userId,
      content: sanitizeInput(content),
      createdAt: now
    });

    return createSuccessResponse({
      update: {
        id: update.id,
        lakeId: update.lake_id,
        content: update.content,
        createdAt: update.created_at
      },
      message: 'Update posted successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating lake update:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to post update', 500);
  }
}
