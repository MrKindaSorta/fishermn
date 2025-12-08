# FisherMN Deployment Guide

This guide covers the complete deployment workflow for the FisherMN project, including GitHub version control and Cloudflare Pages deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Deployment Commands](#deployment-commands)
- [Complete Workflow](#complete-workflow)
- [Deployment Structure](#deployment-structure)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Prerequisites

### 1. Node.js v20+

Wrangler requires Node.js version 20 or higher.

```bash
# Check current version
node --version

# If you need to upgrade (using nvm - recommended)
nvm install 20
nvm use 20
nvm alias default 20

# Verify upgrade
node --version  # Should show v20.x.x or higher
```

### 2. Wrangler CLI

Cloudflare's command-line tool for deployment.

```bash
# Check if installed
wrangler --version

# Install globally (optional)
npm install -g wrangler

# Or use npx (no global install needed)
npx wrangler --version
```

### 3. Cloudflare Account

You need a Cloudflare account for deployment.

```bash
# Log in to Cloudflare (opens browser)
wrangler login

# Verify authentication
wrangler whoami
```

### 4. GitHub Account

For version control and collaboration.

- Sign up at https://github.com if you don't have an account
- Create a new repository for this project (see First-Time Setup)

---

## First-Time Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `fishermn` (or your preference)
3. **Description**: "Community-powered ice fishing app for Minnesota"
4. **Visibility**: Choose Public or Private
5. **Important**: Do NOT initialize with README, .gitignore, or license (we already have these files)
6. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

Replace `USERNAME` with your actual GitHub username:

```bash
# Add GitHub as remote
git remote add origin https://github.com/USERNAME/fishermn.git

# Verify remote was added
git remote -v

# Push existing commits to GitHub
git push -u origin master
```

### Step 3: Verify Setup

```bash
# Check git status
git status

# Verify you're connected to GitHub
git remote -v
```

---

## Deployment Commands

### Full Deployment (Recommended)

```bash
npm run deploy
```

This command:
1. Validates Node.js version (v20+)
2. Builds Tailwind CSS (minified)
3. Cleans the deploy directory
4. Copies all production files
5. Validates the structure
6. Deploys to Cloudflare Pages

### Dry Run (Test Without Deploying)

```bash
npm run deploy:dry-run
```

Prepares the deploy directory without pushing to Cloudflare. Good for:
- Testing the build process
- Verifying files are copied correctly
- Reviewing what will be deployed

### Manual Step-by-Step

```bash
# Step 1: Prepare files for deployment
npm run deploy:prepare

# Step 2: Review the deploy/ directory
ls -la deploy/

# Step 3: Deploy to Cloudflare
npm run deploy:push
```

### Individual Scripts

```bash
# Only build Tailwind CSS
npm run tailwind:build

# Only prepare deployment files
npm run deploy:prepare

# Only push to Cloudflare (requires deploy/ to exist)
npm run deploy:push
```

---

## Complete Workflow

### Daily Development Flow

This is your typical workflow when making changes:

```bash
# 1. Make changes to your files
# (Edit in VS Code, Sublime, or any editor)

# 2. Test changes locally
npm run dev
# Opens at http://localhost:3000
# Test all your changes work correctly

# 3. Version control with Git
git add .
git commit -m "Descriptive message of what you changed"

# 4. Push to GitHub
git push origin master

# 5. Deploy to live site
npm run deploy
```

### Example: Adding a New Lake

```bash
# 1. Edit the data file
nano data/lakes.json
# (Add new lake information)

# 2. Test locally
npm run dev
# Visit http://localhost:3000/lakes.html to verify

# 3. Commit to Git
git add data/lakes.json
git commit -m "Add Mille Lacs Lake to database"

# 4. Push to GitHub
git push origin master

# 5. Deploy to Cloudflare
npm run deploy

# Your site is now live with the new lake!
```

---

## Understanding Git vs Deployment

### Git (GitHub)
- **Purpose**: Version control, collaboration, backup
- **What it does**:
  - Tracks changes over time
  - Allows rollback to previous versions
  - Team members can see your code
  - Acts as a backup of your source code

### Deployment (Cloudflare Pages)
- **Purpose**: Makes your site live on the internet
- **What it does**:
  - Takes your current code
  - Publishes it to a public URL
  - Serves your website to users

### They're Independent
- You can commit to Git without deploying
- You can deploy without pushing to GitHub (but it's recommended to do both)
- Best practice: Always commit + push to GitHub, then deploy

---

## Deployment Structure

### Files Included in Deployment

```
deploy/
├── index.html
├── lakes.html
├── lake.html
├── discussions.html
├── leaderboards.html
├── profile.html
├── css/
│   └── tailwind.css (minified)
├── js/
│   ├── lake-data.js
│   ├── lakes-data.js
│   └── navigation.js
├── data/
│   ├── businesses.json
│   ├── lakes.json
│   ├── leaderboards.json
│   ├── reports.json
│   └── user.json
├── partials/
│   ├── fab-button.html
│   ├── header.html
│   ├── nav-bottom.html
│   ├── rank-badge.html
│   ├── sidebar-nav.html
│   ├── top-bar.html
│   └── xp-bar.html
└── assets/
    └── icons/
```

### Files Excluded from Deployment

These files stay in your source code but don't get deployed:

- `node_modules/` - Dependencies (not needed in production)
- `src/` - Tailwind source CSS (already built to css/tailwind.css)
- `server.js` - Development server (Cloudflare serves files directly)
- `package.json`, `package-lock.json` - Build configuration
- `tailwind.config.js` - Build configuration
- `.git/`, `.gitignore` - Version control files
- Documentation files (README.md, DEPLOYMENT.md, etc.)
- Backup files (*.backup)

---

## Troubleshooting

### Error: "Node.js v20+ required"

**Problem**: Your Node.js version is too old (likely v18).

**Solution**: Upgrade to Node.js v20 or higher.

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x or higher

# Try deployment again
npm run deploy
```

### Error: "Tailwind build failed"

**Problem**: CSS build process encountered an error.

**Solution**: Ensure dependencies are installed.

```bash
# Reinstall dependencies
npm install

# Try building CSS manually
npm run tailwind:build

# Check for errors in src/input.css or tailwind.config.js
```

### Error: "Missing required files"

**Problem**: One or more HTML files are missing.

**Solution**: Verify all required files exist.

```bash
# Check for all HTML files
ls *.html

# Should show:
# - index.html
# - lakes.html
# - lake.html
# - discussions.html
# - leaderboards.html
# - profile.html

# Check CSS was built
ls css/tailwind.css
```

### Error: "Authentication required" / "Not logged in"

**Problem**: Not authenticated with Cloudflare.

**Solution**: Log in to Cloudflare.

```bash
# Open browser and authenticate
wrangler login

# Verify authentication
wrangler whoami

# Try deployment again
npm run deploy
```

### Error: "Failed to push to GitHub"

**Problem**: Git remote not set up or authentication failed.

**Solution**: Verify GitHub remote is configured.

```bash
# Check remote
git remote -v

# If no remote exists, add it (replace USERNAME)
git remote add origin https://github.com/USERNAME/fishermn.git

# Try pushing again
git push origin master
```

### Deploy Succeeded but Site Shows Errors

**Problem**: Deployment completed but site has issues.

**Solution**: Check Cloudflare Pages dashboard.

1. Visit https://dash.cloudflare.com/
2. Navigate to: **Pages** > **fishermn** > **Deployments**
3. Click on the latest deployment
4. Review build logs for errors
5. Check the deployment preview

---

## Best Practices

### 1. Always Test Locally First

```bash
# Before deploying, always test locally
npm run dev

# Visit http://localhost:3000
# Test all pages and functionality
# Only deploy if everything works
```

### 2. Use Descriptive Commit Messages

```bash
# Bad
git commit -m "update"

# Good
git commit -m "Add new lake filter feature to lakes page"
git commit -m "Fix mobile navigation menu overflow issue"
git commit -m "Update leaderboard scoring algorithm"
```

### 3. Use Dry-Run for Validation

```bash
# Before your first deployment of the day
npm run deploy:dry-run

# Check the deploy/ directory
ls -la deploy/

# If everything looks good
npm run deploy
```

### 4. Review Deploy Directory

```bash
# After running deploy:prepare, check what's included
du -sh deploy/  # Check size
find deploy/ -type f | wc -l  # Count files
ls -la deploy/  # Review structure
```

### 5. Monitor Deployments

After deploying:
1. Visit your live site URL (e.g., https://fishermn.pages.dev)
2. Test critical pages (home, lakes, profile)
3. Check browser console for errors (F12 > Console)
4. Verify CSS is loading correctly
5. Test navigation between pages

### 6. Keep Dependencies Updated

```bash
# Periodically update dependencies
npm update

# Check for outdated packages
npm outdated

# Test after updating
npm run dev
```

### 7. Regular Backups

Since your code is on GitHub:
- Your code is automatically backed up
- You can rollback to any previous commit
- You can work from multiple computers
- Team members can collaborate

---

## Configuration

### wrangler.toml

Current Cloudflare configuration:

```toml
name = "fishermn"
compatibility_date = "2025-12-08"

pages_build_output_dir = "./deploy"
```

- `name`: Your Cloudflare Pages project name
- `compatibility_date`: Cloudflare runtime compatibility version
- `pages_build_output_dir`: Directory to deploy (deploy/)

### Custom Domain (Future)

Once deployed, you can configure a custom domain:

1. Go to Cloudflare dashboard
2. Navigate to: **Pages** > **fishermn** > **Custom domains**
3. Click "Set up a domain"
4. Enter your domain (e.g., `fishermn.com`)
5. Update DNS records as instructed
6. Wait for DNS propagation (up to 24 hours)

---

## Useful Links

After setup, bookmark these URLs:

- **Your GitHub Repository**: https://github.com/USERNAME/fishermn
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Your Live Site**: https://fishermn.pages.dev (or your custom domain)
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/

---

## Support

If you encounter issues not covered in this guide:

1. **Check the script output** - Error messages usually explain what went wrong
2. **Review Cloudflare dashboard** - Build logs show detailed errors
3. **Check GitHub** - Verify commits are pushed correctly
4. **Node.js version** - Most issues come from using Node.js v18 instead of v20+

---

## Quick Reference

```bash
# Development
npm run dev                  # Start local dev server

# Deployment
npm run deploy               # Full deployment (prepare + push)
npm run deploy:dry-run       # Test without deploying
npm run deploy:prepare       # Only prepare files
npm run deploy:push          # Only push to Cloudflare

# Git
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push origin master       # Push to GitHub
git status                   # Check repository status
git log                      # View commit history

# Build
npm run tailwind:build       # Build CSS only
npm install                  # Install dependencies
```

---

## Project Structure

```
FisherMN 1.1/website/
├── index.html               # Home/dashboard page
├── lakes.html              # Lake listing page
├── lake.html               # Individual lake detail page
├── discussions.html        # Forum/discussions page
├── leaderboards.html       # Leaderboards page
├── profile.html            # User profile page
├── css/
│   └── tailwind.css        # Built CSS (auto-generated)
├── js/
│   ├── lake-data.js        # Lake data handling
│   ├── lakes-data.js       # Lakes listing logic
│   └── navigation.js       # Navigation functionality
├── data/
│   ├── businesses.json     # Business listings
│   ├── lakes.json          # Lake database
│   ├── leaderboards.json   # Leaderboard data
│   ├── reports.json        # Fishing reports
│   └── user.json           # User data
├── partials/
│   ├── fab-button.html     # Floating action button
│   ├── header.html         # Page header
│   ├── nav-bottom.html     # Bottom navigation
│   ├── rank-badge.html     # User rank badge
│   ├── sidebar-nav.html    # Sidebar navigation
│   ├── top-bar.html        # Top bar
│   └── xp-bar.html         # Experience bar
├── src/
│   └── input.css           # Tailwind source (not deployed)
├── scripts/
│   └── prepare-deploy.sh   # Deployment script
├── package.json            # Node.js configuration
├── tailwind.config.js      # Tailwind configuration
├── wrangler.toml           # Cloudflare configuration
├── .gitignore              # Git ignore rules
└── DEPLOYMENT.md           # This file
```

---

Made with ❄️ for Minnesota ice fishing enthusiasts.
