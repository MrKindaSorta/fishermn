# FisherMN - Front-End Prototype

A community-powered ice fishing and lake information app for Minnesota. This is a static HTML prototype built with Tailwind CSS and HTMX for experimenting with look, feel, and layout.

## 🎯 Project Overview

FisherMN helps ice anglers plan their weekend trips with:
- Real-time ice conditions and safety reports
- Catch reports by species and location
- Lake-life info (bars, bait shops, resorts, casinos)
- Community ranking and rewards system
- 10 launch lakes across Minnesota

## 🛠️ Tech Stack

- **HTML** - Semantic markup
- **Tailwind CSS** - Utility-first styling with custom design system
- **HTMX** - Dynamic interactions without heavy JavaScript
- **Express** - Simple dev server for HTMX partials and mock data
- **JSON** - Mock data files

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build Tailwind CSS:**
   ```bash
   npm run tailwind:build
   ```

3. **Start the development server:**
   ```bash
   npm run serve
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Mode

For active development with auto-reloading CSS:

```bash
npm run dev
```

This runs two processes concurrently:
- Tailwind CSS watch mode (auto-compiles on file changes)
- Express server on port 3000

## 📁 Project Structure

```
website/
├── index.html                      # Dashboard (Home screen)
├── lakes.html                      # Lakes list screen
├── profile.html                    # User profile screen
├── leaderboards.html              # Leaderboards screen
├── css/
│   └── tailwind.css               # Compiled Tailwind CSS
├── js/
│   └── app.js                     # Custom utilities
├── partials/
│   ├── header.html                # App header component
│   ├── nav-bottom.html            # Bottom navigation
│   ├── rank-badge.html            # User rank display
│   ├── xp-bar.html                # XP progress bar
│   └── fab-button.html            # Floating action button
├── data/
│   ├── lakes.json                 # Mock lake data (10 lakes)
│   ├── reports.json               # Mock ice/catch reports
│   ├── user.json                  # Current user profile
│   ├── businesses.json            # Bars, bait, resorts, casinos
│   └── leaderboards.json          # Top contributors
├── src/
│   └── input.css                  # Tailwind source file
├── tailwind.config.js             # Tailwind configuration
├── package.json                   # Dependencies & scripts
├── server.js                      # Express development server
└── README.md                      # This file
```

## 🎨 Design System

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Deep Blue (Primary) | `#0A3A60` | Headings, buttons, nav |
| Ice Blue | `#A7D8F2` | Accents, highlights |
| Frost White | `#F4F9FC` | Background |
| Walleye Gold | `#D4AF37` | XP bars, highlights, FAB |
| Dark Green (Evergreen) | `#1D4D3C` | Success states, badges |
| Danger Red | `#D9534F` | Warnings, dangerous ice |
| Light Gray | `#F1F1F1` | Card backgrounds |
| Panel Gray | `#E5E7EB` | Borders, dividers |

### Typography

- **Font Family:** Inter (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Spacing Scale

- 4px, 8px, 12px, 16px, 24px

### Border Radius

- `rounded-lg` = 0.5rem (8px)
- `rounded-xl` = 0.75rem (12px)
- `rounded-2xl` = 1rem (16px)

## 🧩 Key Features

### Screens

1. **Dashboard (index.html)**
   - User rank badge with reliability stars
   - XP progress bar
   - Stats grid (ice reports, catch reports, lakes visited, check-ins)
   - Recent activity feed

2. **Lakes List (lakes.html)**
   - Search bar (HTMX-powered)
   - Filter buttons (Nearby, Has Casino, 2+ Bars, Has Resort)
   - Scrollable lake cards with condition capsules
   - Click to open detailed lake modal

3. **Profile (profile.html)**
   - User avatar and display name
   - Rank badge
   - Personal stats
   - Settings (email, notifications, location services)

4. **Leaderboards (leaderboards.html)**
   - Top 3 highlighted with gold/silver/bronze
   - Global rankings (Top 20)
   - Current user highlighted
   - Tab navigation (Global, Per-Lake, My Group)

### Components

- **Rank Badge:** Displays user tier (Rookie → State Legend) and metal (Bronze → Platinum)
- **XP Bar:** Visual progress toward next level
- **Lake Cards:** Clickable cards showing lake info and ice conditions
- **Report Cards:** Ice and catch reports with upvote/downvote
- **Bottom Navigation:** Fixed nav bar with 4 tabs
- **FAB Button:** Floating action button for adding reports

### HTMX Interactions

- **Dynamic Lake List:** Loads via `/api/lakes`
- **Lake Search:** Real-time search with 300ms debounce
- **Modal Opening:** Lake detail modal slides up on card click
- **Tab Switching:** Content swaps within modals
- **Form Submission:** Report submission with success feedback

## 📊 Mock Data

All data is stored in JSON files in the `data/` directory:

- **10 Launch Lakes:** Upper Red, Lake of the Woods, Mille Lacs, Leech, Winnie, Vermilion, Gull, Rainy, Otter Tail, Cass
- **17 Sample Reports:** Mix of ice and catch reports with timestamps and votes
- **29 Businesses:** Bars, bait shops, resorts, and casinos across all lakes
- **20 Leaderboard Users:** Global and per-lake top contributors

## 🔧 Customization

### Editing Mock Data

Modify files in the `data/` directory to change lake info, reports, or user data:

```bash
data/lakes.json         # Add/edit lakes
data/reports.json       # Add/edit ice/catch reports
data/user.json          # Change user profile
data/businesses.json    # Add/edit businesses
data/leaderboards.json  # Modify rankings
```

### Modifying Design

1. **Colors:** Edit `tailwind.config.js` → `theme.extend.colors`
2. **Components:** Edit `src/input.css` → `@layer components`
3. **Rebuild CSS:** Run `npm run tailwind:build`

## 🌐 API Endpoints (Express Server)

The Express server (`server.js`) provides mock API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard (index.html) |
| `/lakes.html` | GET | Lakes list screen |
| `/profile.html` | GET | User profile screen |
| `/leaderboards.html` | GET | Leaderboards screen |
| `/partials/:name` | GET | Serve HTML partials |
| `/api/lakes` | GET | Return lakes as HTML cards |
| `/api/lake-detail?id=X` | GET | Return lake detail modal HTML |
| `/api/lake-tabs/:tab?id=X` | GET | Return tab content (reports, amenities, leaderboard) |
| `/api/search-lakes` | POST | Filter lakes by search query |
| `/api/submit-report` | POST | Return success message |

## 📱 Mobile-First Design

- Max-width container: `max-w-md` (448px)
- Bottom navigation for app-like feel
- Touch-friendly button sizes
- Responsive typography and spacing

## 🚧 Future Enhancements

This is a front-end prototype. Next steps:

- [ ] Connect to real backend (Cloudflare Workers)
- [ ] Implement offline-first architecture
- [ ] Add image upload for reports
- [ ] Implement real-time notifications
- [ ] Add geolocation for "Nearby" filter
- [ ] Build out add report modal with form validation
- [ ] Add dark mode toggle
- [ ] Progressive Web App (PWA) features
- [ ] User authentication

## 🤝 Contributing

This is an early-stage prototype. Feel free to:

- Experiment with the design
- Add new lake data
- Create additional components
- Improve HTMX interactions

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❄️ by the FisherMN team**
