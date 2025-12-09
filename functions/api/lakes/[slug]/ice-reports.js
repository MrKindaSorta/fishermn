/**
 * GET/POST /api/lakes/:slug/ice-reports
 * Get ice reports for a lake or submit a new ice report
 */

import { createErrorResponse, createSuccessResponse, sanitizeInput } from '../../../lib/validation.js';
import {
  findLakeBySlug,
  getIceReportsForLake,
  createIceReport,
  formatIceReportForResponse
} from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';
import { incrementReportCount } from '../../../lib/db.js';

// GET - List ice reports for a lake
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

    // Get ice reports
    const reports = await getIceReportsForLake(env.DB, lake.id, limit);
    const formattedReports = reports.map(formatIceReportForResponse);

    return createSuccessResponse({
      reports: formattedReports,
      count: formattedReports.length,
      lakeId: lake.id,
      lakeName: lake.name
    });

  } catch (error) {
    console.error('Error getting ice reports:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve ice reports', 500);
  }
}

// POST - Submit a new ice report (auth required)
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

    const { thicknessInches, condition, locationNotes, latitude, longitude } = body;

    // Validate required fields
    if (typeof thicknessInches !== 'number' || thicknessInches < 0 || thicknessInches > 60) {
      return createErrorResponse('VALIDATION_ERROR', 'Ice thickness must be a number between 0 and 60 inches', 422);
    }

    // Validate condition if provided
    const validConditions = ['excellent', 'good', 'fair', 'poor', 'dangerous'];
    if (condition && !validConditions.includes(condition)) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid ice condition', 422);
    }

    // Generate unique ID
    const reportId = `ice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create the ice report
    const report = await createIceReport(env.DB, {
      id: reportId,
      lakeId: lake.id,
      userId: userId,
      thicknessInches: thicknessInches,
      condition: condition || deriveConditionFromThickness(thicknessInches),
      locationNotes: locationNotes ? sanitizeInput(locationNotes) : null,
      latitude: latitude || null,
      longitude: longitude || null,
      reportedAt: now
    });

    // Increment user's ice report count
    await incrementReportCount(env.DB, userId, 'ice');

    return createSuccessResponse({
      report: {
        id: report.id,
        lakeId: report.lake_id,
        thicknessInches: report.thickness_inches,
        condition: report.condition,
        locationNotes: report.location_notes,
        reportedAt: report.reported_at
      },
      message: 'Ice report submitted successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating ice report:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to submit ice report', 500);
  }
}

/**
 * Derive ice condition from thickness
 */
function deriveConditionFromThickness(inches) {
  if (inches < 4) return 'dangerous';
  if (inches < 6) return 'poor';
  if (inches < 8) return 'fair';
  if (inches < 12) return 'good';
  return 'excellent';
}
