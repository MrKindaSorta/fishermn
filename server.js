const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper function removed - no longer using mock JSON data

// Helper functions removed - no longer using mock data

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
  res.send('<p class="text-secondary p-4 text-center">No lakes available yet. Check back soon!</p>');
});

// API: Get lake detail modal
app.get('/api/lake-detail', (req, res) => {
  res.send('<p class="text-secondary p-4 text-center">Lake details coming soon!</p>');
});

// API: Get lake tab content
app.get('/api/lake-tabs/:tab', (req, res) => {
  const tab = req.params.tab;

  if (tab === 'reports') {
    res.send('<p class="text-secondary p-4">No reports yet. Be the first to submit!</p>');
  } else if (tab === 'amenities') {
    res.send('<p class="text-secondary p-4">No amenities listed yet.</p>');
  } else if (tab === 'leaderboard') {
    res.send('<p class="text-secondary p-4">No leaderboard data yet.</p>');
  } else {
    res.send('<p class="text-secondary p-4">Coming soon!</p>');
  }
});

// API: Search lakes
app.post('/api/search-lakes', (req, res) => {
  res.send('<p class="text-secondary p-4">No lakes found</p>');
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
