/**
 * POST/DELETE /api/lakes/:slug/favorite
 * Add or remove a lake from user's favorites
 */

import { createErrorResponse, createSuccessResponse } from '../../../lib/validation.js';
import {
  findLakeBySlug,
  addLakeFavorite,
  removeLakeFavorite,
  isLakeFavorited
} from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';

// POST - Add lake to favorites
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

    // Check if already favorited
    const alreadyFavorited = await isLakeFavorited(env.DB, userId, lake.id);
    if (alreadyFavorited) {
      return createSuccessResponse({
        isFavorited: true,
        message: 'Lake already in favorites'
      });
    }

    // Add to favorites
    await addLakeFavorite(env.DB, userId, lake.id);

    return createSuccessResponse({
      isFavorited: true,
      message: 'Lake added to favorites'
    }, 201);

  } catch (error) {
    console.error('Error adding favorite:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to add favorite', 500);
  }
}

// DELETE - Remove lake from favorites
export async function onRequestDelete(context) {
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

    // Remove from favorites
    await removeLakeFavorite(env.DB, userId, lake.id);

    return createSuccessResponse({
      isFavorited: false,
      message: 'Lake removed from favorites'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to remove favorite', 500);
  }
}
