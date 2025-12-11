/**
 * Weather History API
 *
 * GET /api/weather-history?region_id=8&days=7
 * Returns historical weather data for a region
 *
 * Used by Bite Forecast to get multi-day weather trends for scoring adjustments
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const regionId = parseInt(url.searchParams.get('region_id'));
    const days = parseInt(url.searchParams.get('days')) || 7;

    // Validate inputs
    if (isNaN(regionId) || regionId < 1 || regionId > 20) {
      return new Response(JSON.stringify({
        error: 'Invalid region_id. Must be between 1 and 20.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (days < 1 || days > 30) {
      return new Response(JSON.stringify({
        error: 'Invalid days parameter. Must be between 1 and 30.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query weather history for this region
    const history = await env.DB.prepare(`
      SELECT *
      FROM weather_history
      WHERE region_id = ?
        AND date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC, time_period DESC
    `).bind(regionId, days).all();

    // Return results
    return new Response(JSON.stringify(history.results || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('[API] Error fetching weather history:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
