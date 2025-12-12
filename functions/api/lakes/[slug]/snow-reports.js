/**
 * GET/POST /api/lakes/:slug/snow-reports
 * Get snow reports for a lake or submit a new snow report
 */

import { createErrorResponse, createSuccessResponse, sanitizeInput } from '../../../lib/validation.js';
import {
  findLakeBySlug,
  getSnowReportsForLake,
  createSnowReport,
  formatSnowReportForResponse
} from '../../../lib/lakes.js';
import { verifyToken } from '../../../lib/auth.js';
import { incrementReportCount } from '../../../lib/db.js';

// GET - List snow reports for a lake
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

    // Get snow reports
    const reports = await getSnowReportsForLake(env.DB, lake.id, limit);
    const formattedReports = reports.map(formatSnowReportForResponse);

    return createSuccessResponse({
      reports: formattedReports,
      count: formattedReports.length,
      lakeId: lake.id,
      lakeName: lake.name
    });

  } catch (error) {
    console.error('Error getting snow reports:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to retrieve snow reports', 500);
  }
}

// POST - Submit a new snow report (auth required)
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

    const { thicknessInches, snowType, coverage, locationNotes, onLake } = body;

    // Validate thickness
    if (typeof thicknessInches !== 'number' || !Number.isInteger(thicknessInches) || thicknessInches < 1 || thicknessInches > 100) {
      return createErrorResponse('VALIDATION_ERROR', 'Snow thickness must be a whole number between 1 and 100 inches', 422);
    }

    // Validate snow type
    const validSnowTypes = ['Fluffy', 'Light', 'Heavy', 'Slushy'];
    if (!snowType || !validSnowTypes.includes(snowType)) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid snow type. Must be one of: Fluffy, Light, Heavy, Slushy', 422);
    }

    // Validate coverage
    const validCoverageTypes = ['Even', 'Patchy', 'Drifted'];
    if (!coverage || !validCoverageTypes.includes(coverage)) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid coverage. Must be one of: Even, Patchy, Drifted', 422);
    }

    // Convert onLake to boolean
    const onLakeValue = onLake === true || onLake === 1;

    // Generate unique ID
    const reportId = `snow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create the snow report
    const report = await createSnowReport(env.DB, {
      id: reportId,
      lakeId: lake.id,
      userId: userId,
      thicknessInches: thicknessInches,
      snowType: snowType,
      coverage: coverage,
      locationNotes: locationNotes ? sanitizeInput(locationNotes) : null,
      reportedAt: now,
      onLake: onLakeValue
    });

    // Increment user's snow report count
    await incrementReportCount(env.DB, userId, 'snow');

    return createSuccessResponse({
      report: {
        id: report.id,
        lakeId: report.lake_id,
        thicknessInches: report.thickness_inches,
        snowType: report.snow_type,
        coverage: report.coverage,
        locationNotes: report.location_notes,
        reportedAt: report.reported_at
      },
      message: 'Snow report submitted successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating snow report:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to submit snow report', 500);
  }
}
