/**
 * GET /api/fish-species
 * Get all fish species grouped by category
 */

import { createErrorResponse, createSuccessResponse } from '../lib/validation.js';

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const result = await env.DB.prepare(`
      SELECT id, name, slug, category, sort_order
      FROM fish_species
      ORDER BY
        CASE category
          WHEN 'Common' THEN 1
          WHEN 'Sportfish' THEN 2
          WHEN 'Rough Fish' THEN 3
          WHEN 'Minnows & Baitfish' THEN 4
          ELSE 5
        END,
        sort_order ASC,
        name ASC
    `).all();

    const species = result.results || [];

    // Group by category
    const grouped = species.reduce((acc, fish) => {
      if (!acc[fish.category]) {
        acc[fish.category] = [];
      }
      acc[fish.category].push({
        id: fish.id,
        name: fish.name,
        slug: fish.slug
      });
      return acc;
    }, {});

    return createSuccessResponse({
      species: grouped,
      count: species.length
    });

  } catch (error) {
    console.error('Error fetching fish species:', error);
    return createErrorResponse('SERVER_ERROR', 'Failed to fetch fish species', 500);
  }
}
