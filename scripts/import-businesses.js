const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');

// Lake name to ID mapping (queried from D1)
const lakeNameMap = {
  'Upper Red Lake': 'lake-1',
  'Lake of the Woods': 'lake-2',
  'Mille Lacs Lake': 'lake-3',
  'Leech Lake': 'lake-4',
  'Lake Winnibigoshish': 'lake-5',
  'Lake Vermilion': 'lake-6',
  'Gull Lake': 'lake-7',
  'Rainy Lake': 'lake-8',
  'Cass Lake': 'lake-10',
  'Big Sandy Lake': 'lake-2542',
  'Pokegama Lake': 'lake-926'
};

// Derive primary business type from category
// Priority: Casino > Resort/Lodging > Bar/Restaurant > Bait > Other
function deriveType(category) {
  const cat = category.toUpperCase();

  if (cat.includes('CASINO') || cat.includes('BINGO')) {
    return 'CASINO';
  }
  if (cat.includes('RESORT') || cat.includes('LODGE') || cat.includes('LODGING') || cat.includes('CABINS') || cat.includes('MOTEL') || cat.includes('HOTEL')) {
    return 'RESORT';
  }
  if (cat.includes('BAR') || cat.includes('RESTAURANT') || cat.includes('TAVERN') || cat.includes('GRILL')) {
    return 'BAR';
  }
  if (cat.includes('BAIT')) {
    return 'BAIT';
  }

  return 'OTHER';
}

// Check if category indicates this amenity
function hasAmenity(category, amenityType) {
  const cat = category.toUpperCase();

  const amenityKeywords = {
    has_food: ['RESTAURANT', 'BAR', 'GRILL', 'TAVERN', 'DINING'],
    has_lodging: ['LODGING', 'RESORT', 'LODGE', 'CABINS', 'HOTEL', 'MOTEL'],
    has_live_bait: ['BAIT'],
    has_tackle: ['TACKLE'],
    has_ice_house_rental: ['ICE HOUSE', 'ICE FISHING HOUSE', 'FISH HOUSE', 'ICE CABINS', 'RENTALS']
  };

  const keywords = amenityKeywords[amenityType] || [];
  return keywords.some(keyword => cat.includes(keyword));
}

// Escape single quotes for SQL
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Main import logic
function importBusinesses() {
  console.log('Reading CSV file...');
  const csvPath = '/mnt/c/Users/Josh Klimek/Downloads/minnesota_lake_amenities.csv';
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvData, { columns: true, skip_empty_lines: true });

  console.log(`Found ${records.length} records in CSV`);

  const validRecords = [];
  const skippedRecords = [];
  const timestamp = new Date().toISOString();

  // Process each record
  records.forEach((record, index) => {
    const lakeName = record.Lake.trim();
    const lakeId = lakeNameMap[lakeName];

    // Skip if lake not in database
    if (!lakeId) {
      console.log(`Skipping record ${index + 1}: Lake "${lakeName}" not found in database`);
      skippedRecords.push({
        ...record,
        reason: 'Lake not in database'
      });
      return;
    }

    // Parse coordinates
    const latitude = parseFloat(record.Latitude);
    const longitude = parseFloat(record.Longitude);

    // Skip if missing coordinates (should not happen after user update)
    if (isNaN(latitude) || isNaN(longitude)) {
      console.log(`Skipping record ${index + 1}: Missing coordinates for "${record.Name}"`);
      skippedRecords.push({
        ...record,
        reason: 'Missing coordinates'
      });
      return;
    }

    // Derive type and amenities
    const type = deriveType(record.Category);
    const has_food = hasAmenity(record.Category, 'has_food') ? 1 : 0;
    const has_lodging = hasAmenity(record.Category, 'has_lodging') ? 1 : 0;
    const has_live_bait = hasAmenity(record.Category, 'has_live_bait') ? 1 : 0;
    const has_tackle = hasAmenity(record.Category, 'has_tackle') ? 1 : 0;
    const has_ice_house_rental = hasAmenity(record.Category, 'has_ice_house_rental') ? 1 : 0;

    validRecords.push({
      id: uuidv4(),
      name: record.Name.trim(),
      type: type,
      lake_id: lakeId,
      latitude: latitude,
      longitude: longitude,
      has_pull_tabs: 0, // Not derivable from CSV
      has_food: has_food,
      has_lodging: has_lodging,
      has_live_bait: has_live_bait,
      has_tackle: has_tackle,
      has_ice_house_rental: has_ice_house_rental,
      website: null,
      phone: null,
      address: record.Address.trim(),
      avg_rating: 0,
      rating_count: 0,
      is_partner: 0,
      is_verified: 1, // All CSV imports are verified
      notes: record.Notes ? record.Notes.trim() : null,
      source_reference: record.Source ? record.Source.trim() : null,
      created_at: timestamp,
      updated_at: timestamp
    });
  });

  console.log(`Valid records: ${validRecords.length}`);
  console.log(`Skipped records: ${skippedRecords.length}`);

  // Generate SQL
  console.log('Generating SQL...');
  const sqlStatements = validRecords.map(record => {
    // Use INSERT OR REPLACE to handle duplicates
    // This will update existing records with same name and lake_id
    return `INSERT OR REPLACE INTO businesses (
      id, name, type, lake_id, latitude, longitude,
      has_pull_tabs, has_food, has_lodging, has_live_bait, has_tackle, has_ice_house_rental,
      website, phone, address,
      avg_rating, rating_count, is_partner, is_verified,
      notes, source_reference,
      created_at, updated_at
    ) VALUES (
      '${record.id}',
      '${escapeSql(record.name)}',
      '${record.type}',
      '${record.lake_id}',
      ${record.latitude},
      ${record.longitude},
      ${record.has_pull_tabs},
      ${record.has_food},
      ${record.has_lodging},
      ${record.has_live_bait},
      ${record.has_tackle},
      ${record.has_ice_house_rental},
      ${record.website ? "'" + escapeSql(record.website) + "'" : 'NULL'},
      ${record.phone ? "'" + escapeSql(record.phone) + "'" : 'NULL'},
      '${escapeSql(record.address)}',
      ${record.avg_rating},
      ${record.rating_count},
      ${record.is_partner},
      ${record.is_verified},
      ${record.notes ? "'" + escapeSql(record.notes) + "'" : 'NULL'},
      ${record.source_reference ? "'" + escapeSql(record.source_reference) + "'" : 'NULL'},
      '${record.created_at}',
      '${record.updated_at}'
    );`;
  });

  const sql = sqlStatements.join('\n\n');

  // Write outputs
  console.log('Writing SQL file...');
  fs.writeFileSync('migrations/import-amenities.sql', sql);

  if (skippedRecords.length > 0) {
    console.log('Writing skipped records file...');
    fs.writeFileSync('migrations/skipped-unknown-lakes.json', JSON.stringify(skippedRecords, null, 2));
  }

  console.log('Done!');
  console.log(`Generated migrations/import-amenities.sql with ${validRecords.length} INSERT statements`);
  if (skippedRecords.length > 0) {
    console.log(`Saved ${skippedRecords.length} skipped records to migrations/skipped-unknown-lakes.json`);
  }

  // Print summary stats
  console.log('\nSummary:');
  console.log(`- Total CSV records: ${records.length}`);
  console.log(`- Valid records: ${validRecords.length}`);
  console.log(`- Skipped records: ${skippedRecords.length}`);
  console.log('\nBusinesses by type:');
  const typeCount = {};
  validRecords.forEach(r => {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  });
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('\nBusinesses by lake:');
  const lakeCount = {};
  validRecords.forEach(r => {
    const lakeName = Object.keys(lakeNameMap).find(k => lakeNameMap[k] === r.lake_id);
    lakeCount[lakeName] = (lakeCount[lakeName] || 0) + 1;
  });
  Object.entries(lakeCount).sort((a, b) => b[1] - a[1]).forEach(([lake, count]) => {
    console.log(`  ${lake}: ${count}`);
  });
}

// Run the import
try {
  importBusinesses();
} catch (error) {
  console.error('Error during import:', error);
  process.exit(1);
}
