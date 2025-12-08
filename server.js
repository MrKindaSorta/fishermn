const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper function to read JSON data
function readJSON(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return null;
  }
}

// Helper function to format timestamp as "X hours ago" or "X days ago"
function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}

// Helper function to generate report card HTML
function generateReportCard(report) {
  const tierColors = {
    'Rookie': 'bg-gray-400',
    'Regular': 'bg-blue-500',
    'Local Legend': 'bg-purple-500',
    'Lake Captain': 'bg-gold',
    'State Legend': 'bg-red-500'
  };

  const tierColor = tierColors[report.userRankTier] || 'bg-gray-400';

  let contentHTML = '';
  if (report.type === 'ice') {
    contentHTML = `
      <div class="space-y-2">
        <div class="flex gap-4">
          <span class="text-sm"><strong>Thickness:</strong> ${report.thickness}"</span>
          <span class="text-sm"><strong>Quality:</strong> ${report.quality}</span>
        </div>
        <div class="text-sm"><strong>Location:</strong> ${report.quadrant} quadrant</div>
      </div>
    `;
  } else if (report.type === 'catch') {
    contentHTML = `
      <div class="space-y-2">
        <div class="flex gap-4">
          <span class="text-sm"><strong>Species:</strong> ${report.species}</span>
          <span class="text-sm"><strong>Count:</strong> ${report.count}</span>
        </div>
        <div class="flex gap-4">
          <span class="text-sm"><strong>Length:</strong> ${report.biggestLength}"</span>
          <span class="text-sm"><strong>Depth:</strong> ${report.depthBand}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="card mb-3">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="badge ${tierColor} text-white">${report.userRankTier} ${report.userRankBand}</span>
          <span class="font-semibold">${report.userName}</span>
        </div>
        <span class="text-xs text-secondary">${timeAgo(report.timestamp)}</span>
      </div>
      ${contentHTML}
      <div class="flex gap-3 mt-3 pt-3 border-t border-grayPanel">
        <button class="flex items-center gap-1 text-sm text-secondary hover:text-primary">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
          </svg>
          <span>${report.upvotes}</span>
        </button>
        <button class="flex items-center gap-1 text-sm text-secondary hover:text-primary">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span>${report.downvotes}</span>
        </button>
        <button class="text-sm text-secondary hover:text-primary">Fact-check</button>
      </div>
    </div>
  `;
}

// Routes

// Main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/lakes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'lakes.html'));
});

app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/leaderboards.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'leaderboards.html'));
});

// Serve partials
app.get('/partials/:name', (req, res) => {
  const filename = req.params.name;
  res.sendFile(path.join(__dirname, 'partials', filename));
});

// API: Get lakes list as HTML
app.get('/api/lakes', (req, res) => {
  const lakes = readJSON('lakes.json');
  if (!lakes) {
    return res.status(500).send('<p class="text-danger">Error loading lakes</p>');
  }

  const lakesHTML = lakes.map(lake => {
    const icons = [];
    if (lake.barCount > 0) icons.push('🍺');
    if (lake.baitCount > 0) icons.push('🎣');
    if (lake.resortCount > 0) icons.push('🏠');
    if (lake.hasCasino) icons.push('🎰');

    const conditionColor = {
      'Good': 'bg-evergreen text-white',
      'Fair': 'bg-gold text-white',
      'Poor': 'bg-danger text-white',
      'Marginal': 'bg-gray-400 text-white'
    }[lake.iceCondition] || 'bg-grayPanel';

    return `
      <div class="card mb-3 cursor-pointer hover:shadow-md transition-shadow"
           hx-get="/api/lake-detail?id=${lake.id}"
           hx-target="#modal-container"
           hx-swap="innerHTML">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold">${lake.name}</h3>
            <div class="flex gap-2 mt-1 text-lg">
              ${icons.join(' ')}
            </div>
          </div>
          <div class="text-right">
            <span class="badge ${conditionColor}">Ice: ${lake.iceCondition}</span>
            <p class="text-xs text-secondary mt-1">${lake.recentReports} reports</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  res.send(lakesHTML);
});

// API: Get lake detail modal
app.get('/api/lake-detail', (req, res) => {
  const lakeId = req.params.id || req.query.id;
  const lakes = readJSON('lakes.json');
  const reports = readJSON('reports.json');

  if (!lakes || !reports) {
    return res.status(500).send('<p>Error loading data</p>');
  }

  const lake = lakes.find(l => l.id === lakeId) || lakes[0];
  const lakeReports = reports.filter(r => r.lakeId === lake.id).slice(0, 5);

  const reportsHTML = lakeReports.map(report => generateReportCard(report)).join('');

  const modalHTML = `
    <div class="modal-backdrop" onclick="document.getElementById('modal-container').innerHTML = ''"></div>
    <div class="modal-container">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">${lake.name}</h2>
        <button onclick="document.getElementById('modal-container').innerHTML = ''"
                class="text-secondary hover:text-primary">
          <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="flex gap-4 border-b border-grayPanel mb-4">
        <button class="tab tab-active"
                hx-get="/api/lake-tabs/reports?id=${lake.id}"
                hx-target="#tab-content"
                hx-swap="innerHTML">
          Reports
        </button>
        <button class="tab"
                hx-get="/api/lake-tabs/amenities?id=${lake.id}"
                hx-target="#tab-content"
                hx-swap="innerHTML">
          Amenities
        </button>
        <button class="tab"
                hx-get="/api/lake-tabs/leaderboard?id=${lake.id}"
                hx-target="#tab-content"
                hx-swap="innerHTML">
          Leaderboard
        </button>
      </div>

      <div id="tab-content" class="max-h-96 overflow-y-auto">
        ${reportsHTML || '<p class="text-secondary">No reports yet for this lake.</p>'}
      </div>

      <button class="btn-primary w-full mt-4">Add Report</button>
    </div>
  `;

  res.send(modalHTML);
});

// API: Get lake tab content
app.get('/api/lake-tabs/:tab', (req, res) => {
  const tab = req.params.tab;
  const lakeId = req.query.id;

  const reports = readJSON('reports.json');
  const businesses = readJSON('businesses.json');
  const leaderboards = readJSON('leaderboards.json');

  if (tab === 'reports') {
    const lakeReports = reports.filter(r => r.lakeId === lakeId).slice(0, 10);
    const html = lakeReports.map(report => generateReportCard(report)).join('');
    res.send(html || '<p class="text-secondary">No reports yet.</p>');
  } else if (tab === 'amenities') {
    const lakeBusinesses = businesses.filter(b => b.lakeId === lakeId);
    const html = lakeBusinesses.map(biz => `
      <div class="card mb-3">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold">${biz.name}</h4>
            <p class="text-sm text-secondary">${biz.type}</p>
          </div>
          <div class="text-right">
            <div class="text-gold">★ ${biz.avgRating.toFixed(1)}</div>
            <p class="text-xs text-secondary">${biz.ratingCount} reviews</p>
          </div>
        </div>
        ${biz.hasPullTabs || biz.hasFood || biz.hasLodging ? `
          <div class="flex gap-2 mt-2">
            ${biz.hasPullTabs ? '<span class="text-xs badge bg-grayLight">Pull Tabs</span>' : ''}
            ${biz.hasFood ? '<span class="text-xs badge bg-grayLight">Food</span>' : ''}
            ${biz.hasLodging ? '<span class="text-xs badge bg-grayLight">Lodging</span>' : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
    res.send(html || '<p class="text-secondary">No businesses listed yet.</p>');
  } else if (tab === 'leaderboard') {
    const lakeLeaderboard = leaderboards.perLake && leaderboards.perLake[lakeId]
      ? leaderboards.perLake[lakeId]
      : [];
    const html = lakeLeaderboard.map((user, idx) => `
      <div class="flex items-center justify-between py-3 border-b border-grayPanel">
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-secondary">#${idx + 1}</span>
          <div>
            <p class="font-semibold">${user.displayName}</p>
            <p class="text-xs text-secondary">${user.rankTier} ${user.rankBand}</p>
          </div>
        </div>
        <span class="font-bold text-gold">${user.contributions} reports</span>
      </div>
    `).join('');
    res.send(html || '<p class="text-secondary">No leaderboard data yet.</p>');
  }
});

// API: Search lakes
app.post('/api/search-lakes', (req, res) => {
  const query = req.body.q || req.query.q || '';
  const lakes = readJSON('lakes.json');

  const filtered = lakes.filter(lake =>
    lake.name.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    return res.send('<p class="text-secondary p-4">No lakes found</p>');
  }

  const lakesHTML = filtered.map(lake => {
    const icons = [];
    if (lake.barCount > 0) icons.push('🍺');
    if (lake.baitCount > 0) icons.push('🎣');
    if (lake.resortCount > 0) icons.push('🏠');
    if (lake.hasCasino) icons.push('🎰');

    const conditionColor = {
      'Good': 'bg-evergreen text-white',
      'Fair': 'bg-gold text-white',
      'Poor': 'bg-danger text-white'
    }[lake.iceCondition] || 'bg-grayPanel';

    return `
      <div class="card mb-3 cursor-pointer hover:shadow-md transition-shadow"
           hx-get="/api/lake-detail?id=${lake.id}"
           hx-target="#modal-container"
           hx-swap="innerHTML">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold">${lake.name}</h3>
            <div class="flex gap-2 mt-1 text-lg">
              ${icons.join(' ')}
            </div>
          </div>
          <div class="text-right">
            <span class="badge ${conditionColor}">Ice: ${lake.iceCondition}</span>
            <p class="text-xs text-secondary mt-1">${lake.recentReports} reports</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  res.send(lakesHTML);
});

// API: Submit report
app.post('/api/submit-report', (req, res) => {
  // In a real app, this would save to database
  // For now, just return success message
  res.send(`
    <div class="bg-evergreen text-white p-4 rounded-lg text-center">
      Report submitted successfully! +20 XP
    </div>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   FisherMN Server Running!             ║
║                                        ║
║   🎣 http://localhost:${PORT}            ║
║                                        ║
║   Press Ctrl+C to stop                 ║
╚════════════════════════════════════════╝
  `);
});
