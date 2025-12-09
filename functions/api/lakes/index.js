/**
 * GET /api/lakes
 * List all lakes with optional filtering
 */

import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';
import { getAllLakes, formatLakeForResponse, getLakeReportCounts } from '../../lib/lakes.js';

export async function onRequestGet(context) {
  const { env, request } = context;

  try {
    // Get all lakes
    const lakes = await getAllLakes(env.DB);

    // Format lakes and get report counts
    const formattedLakes = await Promise.all(
      lakes.map(async (lake) => {
        const formatted = formatLakeForResponse(lake);
        const counts = await getLakeReportCounts(env.DB, lake.id);
        return {
          ...formatted,
          reportCounts: counts
        };
      })
    );

    return createSuccessResponse({
      lakes: formattedLakes,
      count: formattedLakes.length
    });

  } catch (error) {
    console.error('Error getting lakes:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve lakes', 500);
  }
}
