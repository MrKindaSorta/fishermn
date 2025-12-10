import fs from 'fs';

// Existing 10 lakes in database
const existingLakes = [
  { id: 'lake-1', name: 'Upper Red Lake' },
  { id: 'lake-2', name: 'Lake of the Woods' },
  { id: 'lake-3', name: 'Mille Lacs Lake' },
  { id: 'lake-4', name: 'Leech Lake' },
  { id: 'lake-5', name: 'Lake Winnibigoshish' },
  { id: 'lake-6', name: 'Lake Vermilion' },
  { id: 'lake-7', name: 'Gull Lake' },
  { id: 'lake-8', name: 'Rainy Lake' },
  { id: 'lake-9', name: 'Otter Tail Lake' },
  { id: 'lake-10', name: 'Cass Lake' }
];

// Read CSV
const csvPath = '/mnt/c/Users/Josh Klimek/Desktop/MN Lake data/mn_lakes_centroids.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Parse CSV and separate into updates vs new inserts
const lakesToUpdate = [];
const lakesToInsert = [];
const slugCounts = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const [name, lat, lon] = line.split(',');

  // Skip invalid rows
  if (!name || !name.trim()) {
    console.warn(`Skipping row ${i}: empty name`);
    continue;
  }

  // Validate coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    console.warn(`Skipping ${name}: invalid coordinates`);
    continue;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    console.warn(`Skipping ${name}: out of range coordinates`);
    continue;
  }

  // Check if this is one of the existing 10 lakes
  const normalizedName = name.trim().toLowerCase();
  const existingLake = existingLakes.find(l => l.name.toLowerCase() === normalizedName);

  if (existingLake) {
    // This is an existing lake - generate UPDATE statement
    lakesToUpdate.push({
      id: existingLake.id,
      name: name.trim(),
      latitude,
      longitude
    });
  } else {
    // This is a new lake - generate INSERT statement
    // Generate slug (kebab-case)
    let slug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Handle slug collisions
    if (slugCounts[slug]) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    lakesToInsert.push({
      name: name.trim(),
      slug,
      latitude,
      longitude
    });
  }
}

console.log(`✅ Parsed CSV:`);
console.log(`   Lakes to UPDATE (existing): ${lakesToUpdate.length}`);
console.log(`   Lakes to INSERT (new): ${lakesToInsert.length}`);
console.log(`   Total after import: ${lakesToUpdate.length + lakesToInsert.length}`);

// Generate UPDATE statements
const timestamp = new Date().toISOString();
const updateStatements = lakesToUpdate.map(lake => {
  return `UPDATE lakes SET latitude = ${lake.latitude}, longitude = ${lake.longitude}, updated_at = '${timestamp}' WHERE id = '${lake.id}';`;
});

// Generate INSERT statements
const insertStatements = lakesToInsert.map((lake, index) => {
  const id = `lake-${index + 11}`; // Start after existing lake-10
  const escapedName = lake.name.replace(/'/g, "''");

  return `INSERT INTO lakes (id, slug, name, region, latitude, longitude, has_casino, has_bait_shop, has_ice_house_rental, has_lodging, has_restaurant, has_boat_launch, has_gas_station, has_grocery, has_guide_service, bars_count, official_ice_thickness, official_ice_condition, official_ice_updated_at, created_at, updated_at)
VALUES ('${id}', '${lake.slug}', '${escapedName}', NULL, ${lake.latitude}, ${lake.longitude}, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, '${timestamp}', '${timestamp}');`;
});

// Write SQL migration file
const migrationContent = `-- Migration: Update existing lakes and import new MN lakes from CSV
-- Generated: ${timestamp}
-- Source: mn_lakes_centroids.csv
--
-- UPDATE statements: ${updateStatements.length} (existing lakes with corrected coordinates)
-- INSERT statements: ${insertStatements.length} (new lakes)
-- Total lakes after migration: ${lakesToUpdate.length + lakesToInsert.length}

-- ========================================
-- Part 1: Update coordinates for existing 10 lakes
-- ========================================

${updateStatements.join('\n')}

-- ========================================
-- Part 2: Insert new lakes
-- ========================================

${insertStatements.join('\n\n')}
`;

const outputPath = 'migrations/004-import-mn-lakes.sql';
fs.writeFileSync(outputPath, migrationContent);

console.log(`\n✅ Generated ${outputPath}`);
console.log(`   UPDATE statements: ${updateStatements.length}`);
console.log(`   INSERT statements: ${insertStatements.length}`);
console.log(`   File size: ${(migrationContent.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Review the generated SQL file`);
console.log(`   2. Test locally: wrangler d1 execute fishermn-db --local --file=${outputPath}`);
console.log(`   3. Run on production: wrangler d1 execute fishermn-db --remote --file=${outputPath}`);
