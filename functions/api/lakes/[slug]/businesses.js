/**
 * GET /api/lakes/:slug/businesses
 * Returns businesses/POIs near a specific lake
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { slug } = params;

  try {
    // First get the lake to verify it exists
    const lake = await env.DB.prepare(
      'SELECT id, name FROM lakes WHERE slug = ?'
    ).bind(slug).first();

    if (!lake) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Lake not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get businesses for this lake
    const businesses = await env.DB.prepare(`
      SELECT
        id,
        name,
        type,
        latitude,
        longitude,
        has_pull_tabs,
        has_food,
        has_lodging,
        has_live_bait,
        has_tackle,
        has_ice_house_rental,
        website,
        phone,
        address,
        avg_rating,
        rating_count,
        is_partner,
        is_verified
      FROM businesses
      WHERE lake_id = ?
      ORDER BY type, name
    `).bind(lake.id).all();

    // Transform to camelCase and group by type
    const transformedBusinesses = (businesses.results || []).map(b => ({
      id: b.id,
      name: b.name,
      type: b.type,
      latitude: b.latitude,
      longitude: b.longitude,
      hasPullTabs: !!b.has_pull_tabs,
      hasFood: !!b.has_food,
      hasLodging: !!b.has_lodging,
      hasLiveBait: !!b.has_live_bait,
      hasTackle: !!b.has_tackle,
      hasIceHouseRental: !!b.has_ice_house_rental,
      website: b.website,
      phone: b.phone,
      address: b.address,
      avgRating: b.avg_rating,
      ratingCount: b.rating_count,
      isPartner: !!b.is_partner,
      isVerified: !!b.is_verified
    }));

    return new Response(JSON.stringify({
      success: true,
      lakeId: lake.id,
      lakeName: lake.name,
      businesses: transformedBusinesses,
      count: transformedBusinesses.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[businesses] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load businesses'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
