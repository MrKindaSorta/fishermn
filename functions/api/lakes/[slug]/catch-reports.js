/**
 * GET/POST /api/lakes/:slug/catch-reports
 * Get catch reports for a lake or submit a new catch report
 */

import { createErrorResponse, createSuccessResponse, sanitizeInput } from '../../../lib/validation.js';
import {
  findLakeBySlug,
  getCatchReportsForLake,
  createCatchReport,
  formatCatchReportForResponse
} from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';
import { incrementReportCount } from '../../../lib/db.js';

// GET - List catch reports for a lake
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

    // Parse query params for limit
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);

    // Get catch reports
    const reports = await getCatchReportsForLake(env.DB, lake.id, limit);
    const formattedReports = reports.map(formatCatchReportForResponse);

    return createSuccessResponse({
      reports: formattedReports,
      count: formattedReports.length,
      lakeId: lake.id,
      lakeName: lake.name
    });

  } catch (error) {
    console.error('Error getting catch reports:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve catch reports', 500);
  }
}

// POST - Submit a new catch report (auth required)
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

    const {
      fishSpecies,
      fishCount,
      largestSizeInches,
      largestWeightLbs,
      depthFeet,
      baitUsed,
      locationNotes,
      photoUrl
    } = body;

    // Validate required fields
    if (!fishSpecies || typeof fishSpecies !== 'string') {
      return createErrorResponse('VALIDATION_ERROR', 'Fish species is required', 422);
    }

    // Validate optional numeric fields
    if (fishCount !== undefined && (typeof fishCount !== 'number' || fishCount < 1 || fishCount > 999)) {
      return createErrorResponse('VALIDATION_ERROR', 'Fish count must be between 1 and 999', 422);
    }

    if (largestSizeInches !== undefined && (typeof largestSizeInches !== 'number' || largestSizeInches < 0 || largestSizeInches > 100)) {
      return createErrorResponse('VALIDATION_ERROR', 'Fish size must be between 0 and 100 inches', 422);
    }

    if (largestWeightLbs !== undefined && (typeof largestWeightLbs !== 'number' || largestWeightLbs < 0 || largestWeightLbs > 200)) {
      return createErrorResponse('VALIDATION_ERROR', 'Fish weight must be between 0 and 200 lbs', 422);
    }

    if (depthFeet !== undefined && (typeof depthFeet !== 'number' || depthFeet < 0 || depthFeet > 500)) {
      return createErrorResponse('VALIDATION_ERROR', 'Depth must be between 0 and 500 feet', 422);
    }

    // Generate unique ID
    const reportId = `catch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create the catch report
    const report = await createCatchReport(env.DB, {
      id: reportId,
      lakeId: lake.id,
      userId: userId,
      fishSpecies: sanitizeInput(fishSpecies),
      fishCount: fishCount || 1,
      largestSizeInches: largestSizeInches || null,
      largestWeightLbs: largestWeightLbs || null,
      depthFeet: depthFeet || null,
      baitUsed: baitUsed ? sanitizeInput(baitUsed) : null,
      locationNotes: locationNotes ? sanitizeInput(locationNotes) : null,
      photoUrl: photoUrl || null,
      caughtAt: now
    });

    // Increment user's catch report count
    await incrementReportCount(env.DB, userId, 'catch');

    return createSuccessResponse({
      report: {
        id: report.id,
        lakeId: report.lake_id,
        fishSpecies: report.fish_species,
        fishCount: report.fish_count,
        largestSizeInches: report.largest_size_inches,
        largestWeightLbs: report.largest_weight_lbs,
        caughtAt: report.caught_at
      },
      message: 'Catch report submitted successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating catch report:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to submit catch report', 500);
  }
}
