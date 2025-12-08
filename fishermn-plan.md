# FisherMN Product Plan

## Executive Summary

**FisherMN** (a play on "Fisherman" for Minnesota) is a community-powered ice fishing and lake information app for Minnesota. The core value proposition: *"Plan your weekend on the ice."*

### Core Pitch
> FisherMN is the live, community-powered ice (and fishing) report for Minnesota lakes, with lake-by-lake ice safety, bite reports, and lake-life info (bars, bait, casinos, events), plus rewards for accurate contributors.

### Unique Value
- Where can we fish?
- Where can we eat?
- Where can we drink?
- Is the ice safe?
- Are they biting?

### Brand & Vibe
- **Informational first** — users will primarily use the app in the week leading up to weekend trips
- Safety-conscious but fun (bars, casinos, social angle)
- Trip-planning friendly

---

## Target Audience

1. **Weekend warriors** — just want "Is this lake safe? Is anyone catching?"
2. **Hardcore ice anglers** — want to flex knowledge and win rewards
3. **Resorts, bars, bait shops** — want traffic and visibility

---

## User Roles

### Anglers
- View ice conditions, bite reports, weather
- Post ice reports, catch reports, reviews for bars/bait shops
- Earn rank, titles, rewards, and remove ads via contributions

### Businesses (Bars, Resorts, Bait Shops)
- Claim their listing (managed by admin in V1)
- Post "official" reports (flagged as such)
- Offer rewards (free beer, appetizer, % off bait, etc.)
- Pay for boosted visibility (future)

### Moderators/Admins
- Resolve disputes, ban spammers
- Curate big seasonal banners ("First safe ice on Mille Lacs!")

---

## V1 Feature Set

### Lake & Map View
- List of lakes (search + filter by distance from user)
- Each lake displays:
  - Current ice conditions (avg thickness, unsafe/marginal/good)
  - Recent ice reports (sorted newest + most trusted)
  - Recent catch reports (species, size, general spot)
  - Weather at that lake (temp, wind, feels-like, forecast)
  - Lake life: bars, resorts, bait shops, casinos with basic info & rating

### Reports System

**Location Privacy Decision:** Reports will NEVER be specific — quadrants and general depth only to protect honey holes.

#### Ice Report
- Date/time
- Location: quadrant (NW, NE, SW, SE, WHOLE_LAKE)
- Thickness (inches)
- Quality (slush, cracks, pressure ridges)
- Confidence level
- Optional photo

#### Catch Report
- Species
- Length or weight
- Number caught
- General spot (quadrant)
- Depth band (Shallow <10ft, Mid 10-20, Deep 20+)
- Lure/bait (optional)

#### Business Review / Lake-Life Report
- Rating
- Notes
- Amenities (pull tabs, food, live music, etc.)

### Data Sources
- **Official reports:** Resorts, bait shops, townships, sheriff departments (long term) — manually verified by admin in V1
- **Community reports:** Weighted by rank, age of report, and fact-check agreement

---

## Ranking System

### Structure: 20 Levels (5 Tiers × 4 Metals)

| Level Range | Tier | Metals |
|-------------|------|--------|
| 1–4 | Rookie | Bronze, Silver, Gold, Platinum |
| 5–8 | Regular | Bronze, Silver, Gold, Platinum |
| 9–12 | Local Legend | Bronze, Silver, Gold, Platinum |
| 13–16 | Lake Captain | Bronze, Silver, Gold, Platinum |
| 17–20 | State Legend | Bronze, Silver, Gold, Platinum |

### XP Threshold Formula
```
XP needed for level N = 100 × N^1.2 (rounded)
```

### XP-Earning Actions

| Action | XP Earned | Notes |
|--------|-----------|-------|
| Submit ice report | +20 XP | |
| Submit catch report | +15 XP | |
| Submit business check-in/report | +10 XP | |
| Fact-check (agree/disagree) | +5 XP | Capped per day |
| Report gets upvoted | +2 XP per upvote | Cap per report |
| Report marked "dangerous but helpful" | +20 XP bonus | |
| Daily usage streak (Day 1–3) | +5 XP/day | |
| Daily usage streak (Day 4+) | +10 XP/day | Resets if skipped |
| Check-in at partner location | +15 XP | GPS verified, limit per business/day |
| First report on lake for that day | +10 XP | "Morning scout" bonus |

### Ranking Down
- Each legitimate DISAGREE on a report: **−3 XP**
- Cap per report: **max −30 XP** from a single post
- Only users **level 5+** can cause XP loss with disagree votes (anti-brigade protection)

### Reliability Rating (Separate from Rank)
- 1–5 star system for both users AND businesses
- Based on accuracy of reports
- Votes weighted by reviewer's rank (high-rank votes count more)
- Displayed on reports: rank badge + reliability stars

---

## Trust & Fact-Checking System

### Report Scoring
Each report has a score based on:
- Report age (decay over time)
- Reporter rank
- Community votes (accurate, off, dangerous)

### Visible Labels
- "Community-verified" (high agreement)
- "Mixed reports – use caution"

### Official Sources
- Flagged accounts: "Resort/Business" or "Sheriff/Official"
- Different icon display
- Still subject to user fact-checks

### Reputation Impact
If reports are frequently flagged as inaccurate:
- Rank progress slows or regresses
- Reports visually marked as "low-trust"

---

## Rewards System

### Seasonal Leaderboards
- Most confirmed ice reports per lake
- Most helpful fact-checks (dangerous ice marked + upvoted)
- Most helpful catch reports

### Prizes
- **Statewide "Top 10":** Entries for big prize (Scheels gift card — $500 goal)
- **Lake-specific:** Smaller rewards (bar/restaurant gift cards)
- **Early seasons:** Smaller rewards to build culture
  - "Top Reporter of the Month" → $25 gift card
  - "Top Fact Checker" → FisherMN merch
  - "Winter Season Award" → grows into $500 Scheels with traction

### Business-Side Rewards (Future)
- "First 20 Rank 2+ users to check in get a free beer/soda"
- "Post a verified ice report near our access = BOGO appetizer"
- Reward wallet view: unlocked offers with QR codes or single-use codes

### Reward Funding
- Out of pocket initially
- Sponsorships as app gains traction

---

## Monetization

### Ads
- Single banner ad for basic/new users
- No ads unlocked via:
  - Reaching **Level 12 (Local Legend Gold)** or above, OR
  - Purchasing "No Ads" IAP (~$4.99/year)

### Subscription: FisherMN Plus (~$2.99/month)
Includes:
- Amenities details & advanced filters (2+ bars, has casino, has resort with lodging)
- In-depth lake stats (hourly trends, historical bites)
- Extra favorites (more lakes)
- Early access to new features

### High Rank Perks (Level 18–20)
- Full Plus features unlocked automatically
- Special badge/flex

### Business Plans (Future)
- Claim listing: Free
- Boosted placement on lake page: Paid
- Sponsor lake leaderboards: Paid
- Feature events (tournaments, meat raffles): Paid

---

## Screens & UX

### Home Screen (Dashboard)
- Rank badge + metal
- Reliability stars
- XP bar + "X XP to next rank"
- Quick stats:
  - Ice reports submitted
  - Catch reports submitted
  - Lakes visited
  - Check-ins this season
- Short feed: "Recent activity on your favorite lakes"

### Lakes Screen
- Search + filter (distance, has casino, has 2+ bars, etc.)
- List view with:
  - Lake name
  - Icons: bars, bait, resorts, casino
  - Conditions capsule: "Ice: Fair, 10 recent reports"
- Tap lake → modal/slide-up sheet with tabs:
  - **Reports** (ice & catch)
  - **Amenities** (bars/bait/resorts/casinos)
  - **Leaderboard** (top contributors on that lake)
  - "Add report" button

### Add (+) Floating Button
Tap → options:
- "Ice report"
- "Catch report"
- "Business check-in / review"

### User Profile
- Personal info
- Settings

### Leaderboards
- **Default global:** "Top contributors this season"
- **Per-lake:** "Top Upper Red contributors"
- **User-created:** "My group's leaderboard" (friends-only)
- **Business-created (future):** "XYZ Resort Derby Board"

---

## Offline-First Architecture

### Local Storage (Device)

**Cached Data Per Lake:**
- Lake info
- Businesses
- Last 20–50 reports

**User Metadata:**
- Current rank, XP
- Reliability rating (for display)

**Pending Actions Queue:**
- type: REPORT, FACT_CHECK, UPVOTE, CHECK_IN, etc.
- payload: serialized data
- created_at
- status: PENDING, SENT, FAILED

### Sync Flow
1. User submits report/check-in/vote with no service
2. App saves to local DB immediately
3. UI updates optimistically (XP, rank bar, etc.)
4. Background sync job:
   - When network available, drains queue, sends batched API calls
   - On success: marks entries as SENT, updates from server truth
   - On error: keeps entries, shows subtle "Sync issue" banner

**Key Requirement:** All rank-affecting events must be loggable offline. Server is final arbiter, but user sees immediate feedback.

---

## Data Model

### Tables

#### users
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| display_name | String | |
| email | String | |
| rank_level | Int (1–20) | |
| rank_tier | Enum | Rookie, Regular, LocalLegend, Captain, StateLegend |
| rank_band | Enum | Bronze, Silver, Gold, Platinum |
| xp | Int | |
| reliability_score | Float (1–5) | |
| reliability_votes | Int | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### lakes
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | |
| region | String | |
| center_lat | Decimal | |
| center_lon | Decimal | |
| has_casino | Boolean | |
| notes | Text | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### businesses
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | |
| type | Enum | BAR, BAIT, RESORT, CASINO, OTHER |
| lake_id | UUID (nullable) | For nearby but not on-lake |
| lat | Decimal | |
| lon | Decimal | |
| has_pull_tabs | Boolean | |
| has_food | Boolean | |
| has_lodging | Boolean | |
| website | String | |
| phone | String | |
| avg_rating | Float (1–5) | |
| rating_count | Int | |
| is_partner | Boolean | Paying business |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### reports (Single Table for All Report Types)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| lake_id | UUID | |
| user_id | UUID (nullable) | Null for official |
| business_id | UUID (nullable) | For business-specific check-in/report |
| type | Enum | ICE, CATCH, BUSINESS, GENERAL |
| title | String | Short |
| body | Text | |
| created_at | Timestamp | |
| **Ice-specific** | | |
| ice_thickness_in | Decimal | |
| ice_quality | Enum | GOOD, FAIR, POOR, DANGEROUS |
| quadrant | Enum | NW, NE, SW, SE, WHOLE_LAKE |
| **Catch-specific** | | |
| species | String | |
| count | Int | |
| biggest_length_in | Decimal | |
| depth_band | Enum | SHALLOW, MID, DEEP |
| **Meta** | | |
| is_official | Boolean | |
| upvotes | Int | |
| downvotes | Int | |
| score | Float | Precomputed for ranking |

#### fact_checks
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| report_id | UUID | |
| user_id | UUID | |
| verdict | Enum | AGREE, DISAGREE, DANGEROUS |
| created_at | Timestamp | |

#### rewards
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | |
| description | Text | |
| sponsor_type | Enum | FISHERMN, BUSINESS |
| business_id | UUID (nullable) | |
| min_rank_level | Int | Can only claim at or above |
| max_claims_per_user | Int | |
| valid_from | Timestamp | |
| valid_to | Timestamp | |

---

## Tech Stack

### Mobile App
- **Flutter** (Android + iOS from one codebase)
- **Local DB:** sqflite or drift (for offline caching + sync queue)

### Web
- Flutter web build for parity, OR
- Separate simple site (HTMX/Tailwind) for web map + reading reports

### Backend
- **Cloudflare Workers** for APIs
- **D1 / PostgreSQL** (Neon, Supabase) for structured data
- **Cloudflare R2** for photo storage

### Auth
- Email + password
- Sign in with Google/Apple (later)

### Location
- Device GPS for nearby lakes
- GPS verification for check-ins

---

## Safety & Liability

### Disclaimers
- Prominent everywhere: *"Ice is never 100% safe. Use reports as a guide, not a guarantee."*

### Danger Highlighting
- "Break-through near west access"
- "Open water by bridge"

### Safety Tips Screen
- Thickness guidelines
- Recommended gear (spud bar, picks, float suit)

---

## V1 Launch Lakes (10 Lakes)

### 1. Upper Red Lake
**Bars/Restaurants:**
- West Wind Resort Bar & Grill
- JR's Corner Access Bar
- Rogers on Red Bar

**Bait Shops:**
- West Wind Bait
- JR's Bait
- Mort's Dock Bait

**Resorts/Access Points:**
- West Wind Resort
- JR's Corner Access
- Rogers on Red
- Beacon Harbor

**Casinos:** None on lake

---

### 2. Lake of the Woods
**Bars/Restaurants:**
- Sportsman's Lodge Bar
- Wigwam Resort Bar
- Arnesen's Rocky Point Bar
- The Igloo Bar (on-ice seasonal at Zippel Bay)

**Bait Shops:**
- Lake of the Woods Bait & Tackle
- Adrian's Resort Bait

**Resorts/Access Points:**
- Sportsman's Lodge
- Ballard's Resort
- Arnesen's Rocky Point
- River Bend Resort

**Casinos:** Seven Clans Casino (Warroad – lakeside)

---

### 3. Mille Lacs Lake
**Bars/Restaurants:**
- The Blue Goose
- Castaways Bar
- Twin Pines Bar
- Beachside Bar (Appeldoorn's)

**Bait Shops:**
- Lyback's Bait
- Johnson's Portside
- Hunters Point Bait

**Resorts/Access Points:**
- Appeldoorn's
- Hunter's Point
- Red Door Resort
- Twin Pines

**Casinos:** Grand Casino Mille Lacs (Onamia)

---

### 4. Leech Lake
**Bars/Restaurants:**
- Chase on the Lake Bar
- Walker Bay Bar & Grill
- Tianna Country Club Bar

**Bait Shops:**
- Reed's Sporting Goods
- Shriver's Bait
- Swanson's Bait

**Resorts/Access Points:**
- Trapper's Landing
- Hiawatha Beach Resort
- Chase on the Lake

**Casinos:** Northern Lights Casino (Walker)

---

### 5. Lake Winnibigoshish (Lake Winnie)
**Bars/Restaurants:**
- Gosh-Dam Place
- High Banks Bar

**Bait Shops:**
- Winnie Bait & Tackle
- High Banks Bait

**Resorts/Access Points:**
- High Banks Resort
- Nodak Lodge
- Eagle Nest Lodge

**Casinos:** None close

---

### 6. Lake Vermilion
**Bars/Restaurants:**
- The Vermilion Club
- The Landing Restaurant

**Bait Shops:**
- Vermilion House Bait
- Ben's Bait

**Resorts/Access Points:**
- Ludlow's Island Resort
- Everett Bay Lodge
- White Eagle Resort

**Casinos:** Fortune Bay Resort Casino (on the lake)

---

### 7. Gull Lake (Brainerd)
**Bars/Restaurants:**
- Zorbaz on Gull Lake
- Ernie's on Gull Lake
- Quarterdeck Bar

**Bait Shops:**
- S&W Bait
- Oars-N-Mine Bait

**Resorts/Access Points:**
- Quarterdeck Resort
- Cragun's Resort
- Madden's

**Casinos:** None on lake

---

### 8. Rainy Lake (International Falls)
**Bars/Restaurants:**
- Thunderbird Lodge Bar
- Sha Sha Resort Bar

**Bait Shops:**
- Rainy Lake One Stop
- Loon's Nest Bait

**Resorts/Access Points:**
- Thunderbird Lodge
- Sha Sha Resort
- Rainy Lake Resort & Outfitters

**Casinos:** None on lake

---

### 9. Otter Tail Lake
**Bars/Restaurants:**
- Beach Bums Bar & Grill
- Zorbaz (Ottertail)

**Bait Shops:**
- The Ottertail Country Bait Shop
- Gene's Sport Shop

**Resorts/Access Points:**
- The Lodge at Otter Tail
- Holly's Resort

**Casinos:** None (Thumper Pond Resort nearby, not a casino)

---

### 10. Cass Lake
**Bars/Restaurants:**
- Cass Lake Lodge Bar
- Pike Hole Bar & Grill (nearby)

**Bait Shops:**
- The Fish Shop
- Froggy's Bait

**Resorts/Access Points:**
- Cass Lake Lodge
- Stony Point Resort
- Wishbone Resort

**Casinos:** Cedar Lakes Casino (Cass Lake)

---

## Rollout Roadmap

### Phase 1 – Prototype / Private Beta
- Data model for: users, lakes, businesses, reports, ratings, XP
- Basic features:
  - Nearby lakes list
  - Lake details with all report types
  - Simple XP & rank
  - Banner ads (AdMob)
- Seed the 10 launch lakes

### Phase 2 – Public MN Launch
- Leaderboards + rewards
- Business claim flow
- Fact-checking + trust weighting
- Push notifications:
  - "New ice report on a lake you follow"
  - "Conditions changed to unsafe on Lake X"

### Phase 3 – Summer Mode + Expansion
- "Season mode" toggle: Ice / Open Water
- Open-water-specific data:
  - Water temps
  - Weed lines (approx)
  - Boat access conditions
- Expand to other states if successful

---

## Next Steps - Backend Implementation

### Phase 1: Foundation & Database (Week 1)

**Priority: IMMEDIATE**

#### 1.1 Set Up Cloudflare D1 Database
```bash
# Create database
wrangler d1 create fishermn-db

# Initialize migrations folder
mkdir -p workers/migrations
```

#### 1.2 Create Database Schema
Create migration file: `workers/migrations/0001_initial.sql`

Tables to create:
- `users` - User accounts with rank/XP/reliability
- `lakes` - 10 launch lakes with metadata
- `reports` - Ice and catch reports (unified table)
- `votes` - Upvote/downvote tracking
- `businesses` - Bars, bait shops, resorts, casinos
- `checkins` - User check-ins with GPS verification
- `xp_events` - XP transaction log
- `discussion_threads` - Forum threads
- `discussion_posts` - Forum replies

See detailed schema in `/home/kspadmin/.claude/plans/happy-hatching-cascade.md`

#### 1.3 Initialize Cloudflare Workers Project

⚠️ **IMPORTANT:** Create Workers project at repository root (parallel to website/), NOT inside website/

This avoids conflicts with Cloudflare Pages GitHub integration.

```bash
# Navigate to repository root (FisherMN 1.1/)
cd "C:\Users\Josh Klimek\Desktop\FisherMN 1.1"

# Create workers directory (parallel to website/)
mkdir workers && cd workers

# Initialize project
npm init -y
npm install hono
npm install -D @cloudflare/workers-types typescript wrangler
npx tsc --init
```

Create file structure:
```
FisherMN 1.1/
├── website/              # Frontend (Cloudflare Pages)
│   ├── index.html
│   ├── wrangler.toml     # Pages config (already exists)
│   └── ...
└── workers/              # Backend API (NEW - separate project)
    ├── src/
    │   ├── index.ts      # Main Worker entry
    │   ├── routes/       # API route handlers
    │   ├── middleware/   # Auth, CORS, validation
    │   ├── services/     # Business logic (XP, rank, GPS)
    │   └── utils/        # DB helpers, crypto, JWT
    ├── migrations/
    │   ├── 0001_initial.sql  # Database schema
    │   └── 0002_seed.sql     # Seed 10 lakes + businesses
    ├── wrangler.toml     # Workers config (separate from Pages)
    ├── package.json
    └── tsconfig.json
```

#### 1.4 Configure wrangler.toml
```toml
name = "fishermn-api"
main = "src/index.ts"
compatibility_date = "2025-12-08"

[[d1_databases]]
binding = "DB"
database_name = "fishermn-db"
database_id = "<from-step-1.1>"

[vars]
JWT_SECRET = "generate-random-secret"
FRONTEND_URL = "https://fishermn.com"
```

#### 1.5 Apply Migrations & Seed Data
```bash
# Apply schema
wrangler d1 migrations apply fishermn-db

# Seed lakes and businesses
wrangler d1 execute fishermn-db --file=./migrations/0002_seed.sql
```

**Deliverable:** Database with 10 lakes, ~30 businesses, ready for API integration

---

### Phase 2: Authentication API (Week 1-2)

#### 2.1 Implement Password Hashing
- Use bcrypt (10 salt rounds)
- Store password_hash in users table

#### 2.2 Build Auth Endpoints
```
POST /api/v1/auth/register
  - Validate email, password, display_name
  - Hash password
  - Create user with default rank (Rookie Bronze, Level 1, 0 XP)
  - Return JWT token

POST /api/v1/auth/login
  - Verify email + password
  - Generate JWT (7-day expiration)
  - Set httpOnly cookie
  - Return user profile

GET /api/v1/auth/session
  - Verify JWT from cookie
  - Return current user data

POST /api/v1/auth/logout
  - Clear httpOnly cookie
```

#### 2.3 Create Auth Middleware
Protect routes requiring authentication

#### 2.4 Frontend Integration
- Create `/website/login.html` page
- Create `/website/register.html` page
- Add login state management

**Deliverable:** Users can register, login, and access protected endpoints

---

### Phase 3: Core Reports API (Week 2)

#### 3.1 Ice Report Submission
```
POST /api/v1/reports/ice
Body: {
  lakeId, thickness, quality, quadrant, confidence, notes, photo?
}
Actions:
  - Validate report data
  - Insert into reports table
  - Award +20 XP
  - Check if first report today (+10 bonus XP)
  - Update user rank if threshold crossed
  - Log xp_event
Response: { reportId, xpEarned, newXp, newRank }
```

#### 3.2 Catch Report Submission
```
POST /api/v1/reports/catch
Body: {
  lakeId, species, count, biggestLength, depthBand, quadrant, lure, photo?
}
Actions:
  - Validate report data
  - Insert into reports table
  - Award +15 XP
  - Update user rank
Response: { reportId, xpEarned, newXp, newRank }
```

#### 3.3 Voting System
```
PUT /api/v1/reports/:reportId/vote
Body: { vote: "up" | "down" }
Actions:
  - Check if user already voted (unique constraint)
  - Update votes table
  - Update report upvotes/downvotes count
  - Award +2 XP to report author (upvote)
  - Deduct -3 XP from report author (downvote, if voter is Level 5+)
  - Log xp_event
```

#### 3.4 Fetch Reports
```
GET /api/v1/lakes/:lakeId/reports?type=ice|catch&limit=20&offset=0
  - Query reports for specific lake
  - Include user info (name, rank, reliability)
  - Order by created_at DESC
  - Pagination support
```

#### 3.5 XP Calculation Service
Implement `/workers/src/services/xp.ts`:
```typescript
const XP_VALUES = {
  ICE_REPORT: 20,
  CATCH_REPORT: 15,
  CHECKIN: 15,
  UPVOTE_RECEIVED: 2,
  DOWNVOTE_RECEIVED: -3,
  FIRST_REPORT_TODAY: 10,
  DISCUSSION_POST: 10,
  DISCUSSION_REPLY: 5,
};

function calculateNewRank(xp: number): {
  level: number,
  tier: string,
  band: string
}
```

#### 3.6 Frontend Integration
- Update report submission forms to POST to real API
- Replace mock `/data/reports.json` with API calls
- Show real-time XP updates

**Deliverable:** Users can submit ice/catch reports, vote, and earn XP

---

### Phase 4: User Profiles & Leaderboards (Week 2-3)

#### 4.1 User Profile API
```
GET /api/v1/users/me
  - Return current user full profile
  - Include: rank, XP, reliability, stats, recent activity

PATCH /api/v1/users/me
  - Update display_name, email, preferences

GET /api/v1/users/:userId
  - Public profile view
  - Stats, rank, recent reports
```

#### 4.2 XP History
```
GET /api/v1/users/me/xp-history?limit=50
  - Query xp_events table
  - Return chronological log with event types
  - Include reference_id (report/checkin)
```

#### 4.3 Global Leaderboard
```
GET /api/v1/leaderboards/global?limit=20&offset=0
  - Query users ordered by XP DESC
  - Include report counts
  - Cache for 5 minutes (KV)
```

#### 4.4 Per-Lake Leaderboard
```
GET /api/v1/leaderboards/lake/:lakeId?limit=10
  - Count reports per user for specific lake
  - Order by contributions DESC
  - Cache for 5 minutes
```

#### 4.5 Frontend Integration
- Fetch real leaderboard data
- Update profile page with API
- Display XP history timeline

**Deliverable:** Full profile system with leaderboards

---

### Phase 5: Businesses & Check-ins (Week 3)

#### 5.1 Business Listings
```
GET /api/v1/lakes/:lakeId/businesses
  - Return all businesses near lake
  - Filter by type (bar, bait, resort, casino)

GET /api/v1/businesses/:businessId
  - Return business details
  - Include avg_rating, rating_count, amenities
```

#### 5.2 Check-in Submission
```
POST /api/v1/checkins
Body: {
  businessId, rating, notes, lat, lon
}
Actions:
  - Verify GPS within 100m radius (Haversine formula)
  - Insert checkin with verified flag
  - Award +15 XP if verified
  - Update business avg_rating
  - Log xp_event
Response: { checkinId, xpEarned, verified }
```

#### 5.3 GPS Verification Service
Implement `/workers/src/services/gps.ts`:
```typescript
function isWithinRadius(
  userLat, userLon, businessLat, businessLon, radiusMeters = 100
): boolean
```

#### 5.4 Frontend Integration
- Update check-in form
- Request geolocation permission
- Show verification status

**Deliverable:** GPS-verified check-ins with ratings

---

### Phase 6: Discussions Forum (Week 3-4)

#### 6.1 Thread Management
```
POST /api/v1/discussions
  - Create new thread (lake-specific or general)
  - Award +10 XP

GET /api/v1/discussions?lakeId=optional&sort=hot|new
  - List threads with reply counts
  - Pagination

GET /api/v1/discussions/:threadId
  - Get thread with all posts
  - Include author info
```

#### 6.2 Reply System
```
POST /api/v1/discussions/:threadId/replies
  - Add reply to thread
  - Award +5 XP
  - Update thread reply_count and last_reply_at
```

**Deliverable:** Full discussion forum

---

### Phase 7: Image Uploads (Week 4)

#### 7.1 Set Up Cloudflare R2
```bash
wrangler r2 bucket create fishermn-photos
```

#### 7.2 Image Upload Endpoint
```
POST /api/v1/images/upload
  - Validate image (max 5MB, jpg/png)
  - Resize to max 1200px width
  - Generate UUID filename
  - Upload to R2
  - Return image URL
```

#### 7.3 Update Reports
- Add photo_url field to report submission
- Display images in report cards

**Deliverable:** Photo uploads for reports

---

### Phase 8: Weather Integration (Week 5)

#### 8.1 OpenWeather API
```
GET /api/v1/lakes/:lakeId/weather
  - Fetch from OpenWeather API
  - Cache for 15 minutes
  - Return temp, feels_like, wind, conditions
```

#### 8.2 Frontend Integration
- Display real-time weather on lake detail page

**Deliverable:** Live weather data

---

### Phase 9: Advanced Features (Week 5-6)

#### 9.1 Reliability Scoring
- Calculate based on upvote/downvote ratio
- Weight by reviewer rank
- Display 1-5 stars on reports

#### 9.2 Fact-Check System
- Allow users to mark reports as accurate/dangerous
- Weight high-rank user votes more
- Display community-verified badge

#### 9.3 Streak Tracking
- Daily login bonus (+5/10 XP)
- Consecutive day counter

#### 9.4 Admin Panel
- Moderation tools
- Flag/remove spam
- Pin threads

**Deliverable:** Advanced gamification features

---

### Phase 10: Testing & Deployment (Week 6)

#### 10.1 Testing
- Unit tests for XP calculation
- Integration tests for API endpoints
- Load testing (1000 concurrent users)

#### 10.2 Deploy to Production

**Frontend (Already Deployed):**
✅ Live at https://fishermn.com
✅ Auto-deploys via GitHub integration
✅ Push to main branch → automatic build & deploy

**Backend (To Deploy):**
```bash
# Navigate to workers directory
cd workers

# Build API
npm run build

# Deploy Worker to Cloudflare
wrangler deploy

# API will be available at:
# - Default: https://fishermn-api.workers.dev
# - Custom: https://api.fishermn.com (after domain setup)

# Monitor logs
wrangler tail
```

**Frontend Updates (Use Real API):**
```bash
# Navigate to website directory
cd website

# Update API calls to use production endpoint
# Edit config file or environment variables

# Commit and push (triggers auto-deploy)
git add .
git commit -m "Connect to production API"
git push origin main

# Cloudflare Pages automatically:
# 1. Detects push
# 2. Builds with npm run tailwind:build
# 3. Deploys to fishermn.com
# 4. Live in ~1-2 minutes
```

#### 10.3 Configure Custom Domain
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select fishermn-api worker
3. Settings → Triggers → Custom Domains
4. Add `api.fishermn.com`
5. Update frontend config to use `https://api.fishermn.com`
6. Push frontend changes (auto-deploys)

**Deliverable:** Fully functional production system
- Frontend: fishermn.com (auto-deploys from GitHub)
- Backend: api.fishermn.com (manually deployed via wrangler)

---

### Summary Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Foundation + Auth | Database + Login system |
| 2 | Reports + Profiles | Ice/catch reports, voting, XP |
| 3 | Businesses + Discussions | Check-ins, forum |
| 4 | Images + Weather | Photo uploads, weather API |
| 5 | Advanced Features | Reliability, fact-check, streaks |
| 6 | Testing + Deploy | Production launch |

---

### Success Criteria

✅ **MVP Complete When:**
- Users can register and login
- Ice/catch reports persist to database
- Voting awards/deducts XP correctly
- Rank progression works (Rookie → State Legend)
- Leaderboards show real data
- Check-ins verify GPS
- Discussions fully functional
- All 10 lakes seeded with businesses
- Frontend deployed to fishermn.com
- API deployed to api.fishermn.com

---

### Technical Resources

- **Full Backend Plan:** `/home/kspadmin/.claude/plans/happy-hatching-cascade.md`
- **Database Schema:** Complete SQL in migration files
- **API Spec:** 30+ endpoints documented
- **Frontend:** Already built, needs API integration
- **Cost:** $0-5/month on Cloudflare Free Tier

---

## 🎨 Design System

### Flutter App Design Context

**Use this context whenever generating Flutter UI.**

#### Overall Style
- Clean, modern, outdoors-inspired design
- Rounded corners (8–16px radius)
- Minimal gradients, mostly solid colors
- Consistent spacing scale: 4, 8, 12, 16, 24
- Soft shadows, not heavy

#### Color Palette

**Primary Colors**
| Name | Hex |
|------|-----|
| Deep Blue | `#0A3A60` |
| Ice Blue | `#A7D8F2` |
| Frost White | `#F4F9FC` |

**Accent Colors**
| Name | Hex |
|------|-----|
| Walleye Gold | `#D4AF37` |
| Dark Green (Evergreen) | `#1D4D3C` |
| Danger Red | `#D9534F` |

**Surface Colors**
| Name | Hex |
|------|-----|
| Light Gray | `#F1F1F1` |
| Panel Gray | `#E5E7EB` |

**Text Colors**
| Name | Hex |
|------|-----|
| Primary | `#0A0A0A` |
| Secondary | `#4B5563` |
| Muted | `#9CA3AF` |

#### Typography
- **Title (H1/H2):** bold, rounded sans-serif
- **Body:** medium sans-serif
- **Labels:** small caps or bold, minimal spacing

**Suggested fonts:** Inter, SF Pro, Roboto, or Montserrat

#### Component Guidelines

**Buttons:**
- Solid primary blue
- Rounded corners 12px
- Bold white text

**Cards:**
- White or light gray background
- 12–16px padding
- Subtle elevation (1–3dp shadow)

**Floating Action Button (FAB):**
- Circular
- Walleye Gold or Blue
- White "+" or icon

#### Layouts
- **Dashboard:** card-based sections
- **Lake list:** stacked scroll list, big touch targets
- **Lake sheet/modal:** rounded top corners 24px
- **Reports:** card feed, timestamps small & muted

#### Animations
- Smooth slide transitions
- Light fade-ins
- Don't overanimate — keep snappy and functional

---

### Website Design Context (HTML + Tailwind + HTMX)

**Use this context whenever generating web components or HTML.**

#### Overall Style
- Match Flutter as closely as possible
- Clean, minimal, app-like layout
- Rounded edges (0.5rem to 1rem)
- Soft neutral backgrounds
- No heavy gradients or large drop shadows
- Stick to Tailwind utility classes for consistency

#### Color Palette (Tailwind Config)

```javascript
colors: {
  primary: '#0A3A60',
  ice: '#A7D8F2',
  frost: '#F4F9FC',
  gold: '#D4AF37',
  evergreen: '#1D4D3C',
  danger: '#D9534F',
  grayLight: '#F1F1F1',
  grayPanel: '#E5E7EB',
}
```

#### Spacing Scale
Use Tailwind spacing:
- `p-2 p-4 p-6`
- `rounded-md rounded-lg rounded-xl`
- `gap-2 gap-4 gap-6`

#### Typography
Use Tailwind's font utilities:
- `font-sans font-bold font-medium`
- `text-xl text-lg text-base text-sm text-xs`

**Recommended Google Font:** Inter (matches Flutter's Material text nicely)

#### Component Styling

**Buttons:**
```html
<button class="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-primary/90">
```

**Cards:**
```html
<div class="bg-white rounded-xl p-4 shadow-sm border border-grayPanel">
```

**Modals / Slide-ups:**
```html
<div class="fixed bottom-0 w-full bg-white rounded-t-2xl shadow-xl p-6">
```

**Lists:**
- Use `divide-y divide-grayPanel`
- Each row:
```html
<div class="flex items-center justify-between py-3">
```

#### HTMX Interaction Patterns
- Use `hx-get`, `hx-post`, `hx-target="#modal"` for dynamic modals
- Use `hx-swap="innerHTML"` or `hx-swap="outerHTML"` depending on component
- Show loading spinners using Tailwind `animate-spin` utilities

#### Responsive Behavior
- Mobile-first
- Max-width container: `max-w-md mx-auto` to mimic app feel
- Full-width cards, no floating sidebars
- Sticky bottom bar for "+" button or navigation

#### Icons
Use Heroicons (SVG) or material-style icons for app parity.

#### Animations
Use Tailwind transitions:
```html
transition-all duration-200 ease-out
```

Use fade/slide for modals:
- `translate-y-full` → `translate-y-0`

---

### 💡 Flutter & Web Parity Guide

| Element | Flutter | Website |
|---------|---------|---------|
| Colors | Same palette | Tailwind custom colors |
| Corner Radius | 12–16px | `rounded-lg` / `rounded-xl` |
| Shadow | `elevation: 1–3` | `shadow-sm` |
| Typography | Inter/Roboto | Inter via Google Fonts |
| Layout Style | Card-based | Card-based |
| Component Shapes | Consistent | Consistent |
| Modals | Sliding bottom sheet | HTMX slide-up modal |

**Goal:** Clients won't know which is app or web — the visual system is aligned.
