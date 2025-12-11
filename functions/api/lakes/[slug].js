/**
 * GET /api/lakes/:slug
 * Get a single lake by slug with recent reports
 */

import { createErrorResponse, createSuccessResponse } from '../../lib/validation.js';
import {
  findLakeBySlug,
  formatLakeForResponse,
  getCurrentIceStatus,
  getLakeReportCounts,
  getIceReportsForLake,
  getCatchReportsForLake,
  getSnowReportsForLake,
  formatIceReportForResponse,
  formatCatchReportForResponse,
  formatSnowReportForResponse,
  isLakeFavorited
} from '../../lib/lakes.js';
import { verifyToken } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, params, request } = context;

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

    // Get current ice status from real reports
    const currentIce = await getCurrentIceStatus(env.DB, lake.id);

    // Format lake data with computed ice status
    const formattedLake = formatLakeForResponse(lake, currentIce);

    // Get report counts
    const reportCounts = await getLakeReportCounts(env.DB, lake.id);

    // Get recent ice reports
    const iceReports = await getIceReportsForLake(env.DB, lake.id, 10);
    const formattedIceReports = iceReports.map(formatIceReportForResponse);

    // Get recent catch reports
    const catchReports = await getCatchReportsForLake(env.DB, lake.id, 10);
    const formattedCatchReports = catchReports.map(formatCatchReportForResponse);

    // Get recent snow reports
    const snowReports = await getSnowReportsForLake(env.DB, lake.id, 10);
    const formattedSnowReports = snowReports.map(formatSnowReportForResponse);

    // Check if user has favorited (if authenticated)
    let isFavorited = false;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await verifyToken(token, env.JWT_SECRET);
        if (payload && payload.sub) {
          isFavorited = await isLakeFavorited(env.DB, payload.sub, lake.id);
        }
      } catch (e) {
        // Token invalid, user not authenticated - that's fine
      }
    }

    return createSuccessResponse({
      lake: {
        ...formattedLake,
        reportCounts,
        isFavorited
      },
      iceReports: formattedIceReports,
      catchReports: formattedCatchReports,
      snowReports: formattedSnowReports
    });

  } catch (error) {
    console.error('Error getting lake:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve lake', 500);
  }
}
