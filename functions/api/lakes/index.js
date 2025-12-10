/**
 * GET /api/lakes
 * List lakes with pagination and search support
 * Query params:
 *   - limit: Number of lakes to return (default: 500)
 *   - offset: Number of lakes to skip (default: 0)
 *   - search: Search term for lake name (searches all lakes)
 */

import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';
import { formatLakeForResponse } from '../../lib/lakes.js';

export async function onRequestGet(context) {
  const { env, request } = context;

  try {
    const url = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(url.searchParams.get('limit')) || 500;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const search = url.searchParams.get('search') || '';

    let query;
    let params = [];

    if (search) {
      // Search mode - return ALL matching lakes (no pagination)
      query = `
        SELECT * FROM lakes
        WHERE LOWER(name) LIKE ?
        ORDER BY name ASC
      `;
      params = [`%${search.toLowerCase()}%`];
    } else {
      // Pagination mode - return limited set
      query = `
        SELECT * FROM lakes
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
    }

    // Execute query
    const result = await env.DB.prepare(query).bind(...params).all();
    const lakes = result.results || [];

    // Get total count
    const countResult = await env.DB
      .prepare('SELECT COUNT(*) as total FROM lakes')
      .first();
    const total = countResult?.total || 0;

    // Format lakes (report counts removed - not displayed on list page)
    const formattedLakes = lakes.map(lake => formatLakeForResponse(lake));

    return createSuccessResponse({
      lakes: formattedLakes,
      count: formattedLakes.length,
      total,
      hasMore: !search && (offset + formattedLakes.length < total),
      offset: search ? 0 : offset
    });

  } catch (error) {
    console.error('Error getting lakes:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve lakes', 500);
  }
}
