# FisherMN Authentication Setup Guide

This guide will help you complete the setup for the authentication system that has been implemented.

## What's Been Implemented

✅ **Backend (Cloudflare Pages Functions):**
- User registration and login endpoints
- JWT token authentication
- Google OAuth integration
- Password hashing with bcrypt
- Authentication middleware
- Database queries and utilities

✅ **Frontend:**
- Auth state management (localStorage)
- UI controller for conditional rendering
- Login/Register modal with tabs
- Anti-FOUC (Flash of Unauthorized Content) protection
- Blur overlays for restricted pages
- Navigation updates based on auth state

✅ **Database:**
- Migration file for users table
- Schema supports rank/XP system
- OAuth provider fields

## Setup Steps

### 1. Upgrade Node.js (Required)

The current Node.js version (v18.20.8) is too old for Wrangler. You need Node.js v20+.

**Option A: Using nvm (recommended)**
```bash
nvm install 20
nvm use 20
```

**Option B: Using Volta**
```bash
volta install node@20
```

**Option C: Download from nodejs.org**
Visit https://nodejs.org/ and download Node.js v20 or later.

### 2. Create Cloudflare D1 Database

After upgrading Node.js:

```bash
cd "/mnt/c/Users/Josh Klimek/Desktop/FisherMN 1.1/website"
wrangler d1 create fishermn-db
```

This will output a database ID. Copy it!

### 3. Update wrangler.toml

Open `wrangler.toml` and uncomment the D1 database binding, replacing `<your-database-id>`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "fishermn-db"
database_id = "abc123-your-actual-database-id"
```

### 4. Run Database Migration

```bash
wrangler d1 execute fishermn-db --file=migrations/001-create-users.sql
```

This creates the users table and seeds it with the existing "FisherDude42" user.

### 5. Set Up Google OAuth (Optional but Recommended)

**A. Create Google Cloud Project:**
1. Go to https://console.cloud.google.com/
2. Create a new project: "FisherMN"
3. Enable "Google+ API"

**B. Create OAuth Credentials:**
1. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://fishermn.pages.dev/api/auth/google/callback` (production)

4. Copy the Client ID and Client Secret

### 6. Configure Environment Variables

**For Local Development:**
Create `.dev.vars` file (copy from `.dev.vars.example`):

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and fill in:
```
JWT_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**For Production (Cloudflare Pages):**
Set secrets via Wrangler CLI:

```bash
# Generate JWT secret first:
openssl rand -base64 32

# Then set secrets:
wrangler pages secret put JWT_SECRET
# (paste the generated secret when prompted)

wrangler pages secret put GOOGLE_CLIENT_ID
# (paste your Google Client ID)

wrangler pages secret put GOOGLE_CLIENT_SECRET
# (paste your Google Client Secret)

wrangler pages secret put GOOGLE_REDIRECT_URI
# (enter: https://fishermn.pages.dev/api/auth/google/callback)
```

### 7. Install NPM Dependencies (if not already)

The backend functions use these packages (install them):

```bash
npm install @tsndr/cloudflare-worker-jwt bcryptjs
```

### 8. Test Locally

**Option A: Using Wrangler Pages Dev (recommended for testing Functions)**
```bash
wrangler pages dev --d1 DB=fishermn-db -- npm run serve
```

**Option B: Using Express (current setup, but Functions won't work)**
```bash
npm run dev
```

**Note:** For full authentication testing, use Option A since it runs the Cloudflare Pages Functions.

### 9. Deploy to Production

```bash
npm run deploy
```

This will:
1. Build Tailwind CSS
2. Deploy to Cloudflare Pages
3. Automatically include the `functions/` directory

## How It Works

### Logged-Out User Experience

When a user visits the site without being logged in:

1. **Redirects:**
   - Visiting `/` (Dashboard) → redirects to `/lakes.html`
   - Visiting `/profile.html` → redirects to `/lakes.html`

2. **Full Access:**
   - Lakes page is fully accessible

3. **Restricted Access:**
   - Discussions page shows blurred content with login prompt
   - Leaderboards page shows blurred content with login prompt

4. **Navigation:**
   - Dashboard and Profile links are hidden
   - "Add Report" button opens login modal
   - Sidebar shows "Login / Sign Up" button

### Logged-In User Experience

After successful login:

1. **Full Access:** All pages including Dashboard, Discussions, Leaderboards, and Profile
2. **Navigation:** All nav items visible, user info displayed
3. **Add Report:** Opens report submission form
4. **User Data:** Rank, XP, and stats loaded from database

### Authentication Flow

1. **Login/Register:**
   - User fills in login or registration form
   - Frontend calls `/api/auth/login` or `/api/auth/register`
   - Backend validates, hashes password, generates JWT
   - Token stored in localStorage and HTTP-only cookie
   - Page reloads to show logged-in UI

2. **Google OAuth:**
   - User clicks "Sign in with Google"
   - Redirects to Google OAuth consent screen
   - Google redirects back to `/api/auth/google/callback`
   - Backend creates/logs in user, generates JWT
   - Redirects to Dashboard

3. **Token Management:**
   - Token stored in localStorage (24-hour expiration)
   - Also stored in HTTP-only cookie for API requests
   - On page load, `auth.js` checks token validity
   - `ui-controller.js` renders appropriate UI

## File Structure

```
website/
├── functions/               # Cloudflare Pages Functions (backend)
│   ├── api/auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── logout.js
│   │   ├── me.js
│   │   ├── google.js
│   │   └── google/callback.js
│   ├── lib/
│   │   ├── auth.js         # JWT utilities
│   │   ├── db.js           # D1 queries
│   │   └── validation.js   # Input validation
│   └── _middleware.js      # Auth middleware
│
├── js/                      # Frontend JavaScript
│   ├── auth.js             # Auth state manager
│   ├── ui-controller.js    # Conditional UI rendering
│   └── auth-modal.js       # Login/register modal
│
├── partials/
│   └── auth-modal.html     # Login/register modal HTML
│
├── migrations/
│   └── 001-create-users.sql
│
├── .dev.vars.example       # Environment variables template
└── wrangler.toml           # Cloudflare config
```

## Troubleshooting

### "Authentication required" errors
- Check that JWT_SECRET is set in environment variables
- Verify D1 database is created and migration has run
- Check browser console for token errors

### Google OAuth not working
- Verify redirect URIs match exactly in Google Console
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Make sure you're testing on the correct domain (localhost or production)

### Token expired immediately
- Check JWT_SECRET is set correctly
- Verify system clock is accurate
- Check token expiration in auth.js (currently 24 hours)

### Users table not found
- Run the database migration: `wrangler d1 execute fishermn-db --file=migrations/001-create-users.sql`
- Verify D1 database binding in wrangler.toml

## Next Steps

Once authentication is working:

1. **Test all flows:**
   - Email/password registration
   - Email/password login
   - Google OAuth login
   - Logout
   - Protected routes

2. **Customize:**
   - Adjust token expiration (auth.js)
   - Add password reset functionality
   - Implement email verification
   - Add two-factor authentication

3. **Production:**
   - Set up monitoring
   - Enable rate limiting on auth endpoints
   - Review security settings
   - Test from multiple devices

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- HTTP-only cookies prevent XSS attacks
- SameSite=Strict prevents CSRF attacks
- All connections over HTTPS in production
- Never commit `.dev.vars` to git (already in .gitignore)

## Support

For issues or questions:
- Check the plan file: `/home/kspadmin/.claude/plans/validated-spinning-sunset.md`
- Review Cloudflare D1 docs: https://developers.cloudflare.com/d1/
- Review Pages Functions docs: https://developers.cloudflare.com/pages/functions/
