/**
 * Find Weather Region by Coordinates
 *
 * GET /api/regions/find?lat=46.5&lon=-94.0
 *
 * Returns the weather region that contains the given coordinates,
 * or the nearest region if coordinates fall outside all regions.
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat'));
    const lon = parseFloat(url.searchParams.get('lon'));

    // Validate inputs
    if (isNaN(lat) || isNaN(lon)) {
      return new Response(JSON.stringify({
        error: 'Invalid coordinates. Provide lat and lon as numbers.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all regions from database
    const regions = await env.DB.prepare(
      'SELECT * FROM weather_regions ORDER BY region_id'
    ).all();

    if (!regions.results || regions.results.length === 0) {
      return new Response(JSON.stringify({
        error: 'No regions found in database'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find region that contains these coordinates
    let matchedRegion = null;

    for (const region of regions.results) {
      if (lat >= region.lat_min &&
          lat < region.lat_max &&
          lon >= region.lon_min &&
          lon < region.lon_max) {
        matchedRegion = region;
        break;
      }
    }

    // If no exact match, find nearest region by distance to centroid
    if (!matchedRegion) {
      let nearest = regions.results[0];
      let minDist = Infinity;

      for (const region of regions.results) {
        const dist = Math.sqrt(
          Math.pow(lat - region.centroid_lat, 2) +
          Math.pow(lon - region.centroid_lon, 2)
        );

        if (dist < minDist) {
          minDist = dist;
          nearest = region;
        }
      }

      matchedRegion = nearest;
    }

    // Return matched region
    return new Response(JSON.stringify(matchedRegion), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour (regions don't change)
      }
    });

  } catch (error) {
    console.error('[API] Error finding region:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
