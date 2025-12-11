/**
 * GET/POST /api/comments/:contentType/:contentId
 * Get or create comments for content
 */

import { createErrorResponse, createSuccessResponse, sanitizeInput } from '../../../lib/validation.js';
import { getComments, createComment, getCommentCount, formatCommentForResponse } from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';

// GET - List comments
export async function onRequestGet(context) {
  const { env, params, request } = context;

  try {
    const { contentType, contentId } = params;

    // Validate content type
    const validTypes = ['ice', 'catch', 'snow', 'update'];
    if (!validTypes.includes(contentType)) {
      return createErrorResponse('INVALID_REQUEST', 'Invalid content type', 400);
    }

    // Parse query params
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sortBy') || 'newest'; // 'newest' or 'liked'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate sortBy
    if (!['newest', 'liked'].includes(sortBy)) {
      return createErrorResponse('VALIDATION_ERROR', 'sortBy must be "newest" or "liked"', 422);
    }

    // Get comments
    const comments = await getComments(env.DB, contentType, contentId, { sortBy, limit, offset });
    const formattedComments = comments.map(formatCommentForResponse);

    // Get total count
    const totalCount = await getCommentCount(env.DB, contentType, contentId);

    return createSuccessResponse({
      comments: formattedComments,
      count: formattedComments.length,
      totalCount: totalCount,
      hasMore: offset + formattedComments.length < totalCount,
      sortBy: sortBy
    });

  } catch (error) {
    console.error('Error getting comments:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve comments', 500);
  }
}

// POST - Create comment (auth required)
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

    const userId = payload.sub;

    // Parse request body
    const body = await request.json();
    const { body: commentBody } = body;

    // Validate comment body
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
      return createErrorResponse('VALIDATION_ERROR', 'Comment body is required', 422);
    }

    if (commentBody.length > 144) {
      return createErrorResponse('VALIDATION_ERROR', 'Comment must be 144 characters or less', 422);
    }

    // Generate unique ID
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create comment
    const comment = await createComment(env.DB, {
      id: commentId,
      userId: userId,
      contentType: contentType,
      contentId: contentId,
      body: sanitizeInput(commentBody),
      createdAt: now
    });

    return createSuccessResponse({
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.created_at,
        upvotes: 0,
        downvotes: 0
      },
      message: 'Comment posted successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating comment:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to post comment', 500);
  }
}
