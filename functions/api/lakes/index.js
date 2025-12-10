/**
 * GET /api/lakes
 * List lakes with pagination and search support
 * Query params:
 *   - limit: Number of lakes to return (default: 500)
 *   - offset: Number of lakes to skip (default: 0)
 *   - search: Search term for lake name (searches all lakes)
 */

import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';
import { formatLakeForResponse, getAllCurrentIceStatus } from '../../lib/lakes.js';

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

    // Filter parameters (optional)
    const minThickness = parseInt(url.searchParams.get('minThickness')) || 0;
    const minBars = parseInt(url.searchParams.get('minBars')) || 0;
    const amenities = url.searchParams.get('amenities') || '';
    const amenityList = amenities ? amenities.split(',').filter(Boolean) : [];

    // Check if any filters are active
    const hasFilters = minThickness > 0 || minBars > 0 || amenityList.length > 0;

    // Build base query with ice reports join (for filtering by ice thickness)
    let query = '';
    let params = [];

    // Determine if we need ice reports join
    const needsIceJoin = minThickness > 0;

    // Build SELECT clause with optional ice join
    if (needsIceJoin) {
      query = `
        SELECT lakes.* FROM lakes
        LEFT JOIN (
          SELECT
            lake_id,
            thickness_inches as thickness
          FROM ice_reports ir1
          WHERE reported_at = (
            SELECT MAX(reported_at)
            FROM ice_reports ir2
            WHERE ir2.lake_id = ir1.lake_id
              AND ir2.reported_at > datetime('now', '-24 hours')
          )
        ) AS ice ON ice.lake_id = lakes.id
      `;
    } else {
      query = 'SELECT * FROM lakes';
    }

    // Build WHERE clauses
    const whereConditions = [];

    // Search filter
    if (search) {
      whereConditions.push('LOWER(lakes.name) LIKE ?');
      params.push(`%${search.toLowerCase()}%`);
    }

    // Viewport filter
    if (hasViewport) {
      whereConditions.push('lakes.latitude BETWEEN ? AND ?');
      whereConditions.push('lakes.longitude BETWEEN ? AND ?');
      params.push(south, north, west, east);
    }

    // Ice thickness filter
    if (minThickness > 0) {
      whereConditions.push('ice.thickness >= ?');
      params.push(minThickness);
    }

    // Bars count filter
    if (minBars > 0) {
      whereConditions.push('lakes.bars_count >= ?');
      params.push(minBars);
    }

    // Amenity filters
    const amenityMap = {
      'hasCasino': 'has_casino',
      'hasBaitShop': 'has_bait_shop',
      'hasIceHouseRental': 'has_ice_house_rental',
      'hasLodging': 'has_lodging',
      'hasRestaurant': 'has_restaurant',
      'hasBoatLaunch': 'has_boat_launch',
      'hasGasStation': 'has_gas_station',
      'hasGrocery': 'has_grocery',
      'hasGuideService': 'has_guide_service'
    };

    for (const amenity of amenityList) {
      const dbColumn = amenityMap[amenity];
      if (dbColumn) {
        whereConditions.push(`lakes.${dbColumn} = 1`);
      }
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add ORDER BY (consistent alphabetical sorting)
    query += `
      ORDER BY
        CASE
          WHEN SUBSTR(lakes.name, 1, 1) BETWEEN 'A' AND 'Z'
            OR SUBSTR(lakes.name, 1, 1) BETWEEN 'a' AND 'z' THEN 0
          ELSE 1
        END,
        lakes.name ASC
    `;

    // Add pagination ONLY if no filters are active (user wants ALL filtered results)
    if (!hasFilters) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    // Execute query
    const result = await env.DB.prepare(query).bind(...params).all();
    const lakes = result.results || [];

    // Get total count
    const countResult = await env.DB
      .prepare('SELECT COUNT(*) as total FROM lakes')
      .first();
    const total = countResult?.total || 0;

    // Get current ice status from reports (batch query to avoid N+1)
    const lakeIds = lakes.map(l => l.id);
    const iceStatusMap = await getAllCurrentIceStatus(env.DB, lakeIds);

    // Format lakes with computed ice status from real reports
    const formattedLakes = lakes.map(lake => {
      const computedIce = iceStatusMap[lake.id] || null;
      return formatLakeForResponse(lake, computedIce);
    });

    return createSuccessResponse({
      lakes: formattedLakes,
      count: formattedLakes.length,
      total,
      hasMore: !hasFilters && !search && !hasViewport && (offset + formattedLakes.length < total),
      offset: (search || hasFilters) ? 0 : offset
    });

  } catch (error) {
    console.error('Error getting lakes:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve lakes', 500);
  }
}
