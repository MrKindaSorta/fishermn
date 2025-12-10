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

    // Viewport bounds parameters (optional)
    const north = parseFloat(url.searchParams.get('north'));
    const south = parseFloat(url.searchParams.get('south'));
    const east = parseFloat(url.searchParams.get('east'));
    const west = parseFloat(url.searchParams.get('west'));
    const hasViewport = !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west);

    let query;
    let params = [];

    if (search && hasViewport) {
      // Mode 1: Search within viewport bounds
      query = `
        SELECT * FROM lakes
        WHERE LOWER(name) LIKE ?
          AND latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;
      params = [`%${search.toLowerCase()}%`, south, north, west, east, limit, offset];

    } else if (search) {
      // Mode 2: Search all lakes (no pagination)
      query = `
        SELECT * FROM lakes
        WHERE LOWER(name) LIKE ?
        ORDER BY name ASC
      `;
      params = [`%${search.toLowerCase()}%`];

    } else if (hasViewport) {
      // Mode 3: Viewport query - fetch ALL lakes in bounds
      query = `
        SELECT * FROM lakes
        WHERE latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;
      params = [south, north, west, east, limit, offset];

    } else {
      // Mode 4: Default pagination
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
      hasMore: !search && !hasViewport && (offset + formattedLakes.length < total),
      offset: search ? 0 : offset
    });

  } catch (error) {
    console.error('Error getting lakes:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve lakes', 500);
  }
}
