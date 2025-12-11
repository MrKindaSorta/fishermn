/**
 * GET /api/user/favorites
 * Get current user's favorite lakes with ice status
 * Requires authentication (middleware will verify token)
 */

import { getUserFavoriteLakes, formatLakeForResponse, getAllCurrentIceStatus } from '../../lib/lakes.js';
import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // User ID is attached by middleware after token verification
    const userId = context.data?.user?.sub;

    if (!userId) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    // Fetch user's favorite lakes from database
    const favoriteLakes = await getUserFavoriteLakes(env.DB, userId);

    // If no favorites, return empty array (not an error)
    if (!favoriteLakes || favoriteLakes.length === 0) {
      return createSuccessResponse({
        favoriteLakes: [],
        count: 0
      });
    }

    // Extract lake IDs for batch ice status lookup
    const lakeIds = favoriteLakes.map(lake => lake.id);

    // Get current ice status for all favorite lakes (batch query)
    const iceStatusMap = await getAllCurrentIceStatus(env.DB, lakeIds);

    // Format each lake with computed ice status
    const formattedLakes = favoriteLakes.map(lake => {
      const iceStatus = iceStatusMap[lake.id] || null;
      return formatLakeForResponse(lake, iceStatus);
    });

    return createSuccessResponse({
      favoriteLakes: formattedLakes,
      count: formattedLakes.length
    });

  } catch (error) {
    console.error('Error fetching favorite lakes:', error);
    return createErrorResponse('SERVER_ERROR', 'An error occurred while fetching favorite lakes', 500);
  }
}
