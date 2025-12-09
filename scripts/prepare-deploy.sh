#!/bin/bash

# ============================================================================
# FisherMN Deployment Preparation Script
# ============================================================================
# This script:
# 1. Validates Node.js version (requires v20+)
# 2. Builds Tailwind CSS (minified)
# 3. Cleans and recreates the deploy/ directory
# 4. Copies only production files to deploy/
# 5. Validates the deployment structure
# 6. Displays deployment summary
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FisherMN Deployment Preparation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================================
# Step 0: Validate Node.js Version
# ============================================================================
echo -e "${YELLOW}[0/5] Checking Node.js version...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo -e "${RED}Please install Node.js v20+ to continue${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "  Current Node.js version: v$(node -v | cut -d'v' -f2)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js v20+ required. Current: v$(node -v | cut -d'v' -f2)${NC}"
    echo ""
    echo -e "${YELLOW}Please upgrade Node.js:${NC}"
    echo "  Using nvm (recommended):"
    echo "    nvm install 20"
    echo "    nvm use 20"
    echo "    nvm alias default 20"
    echo ""
    echo "  Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Node.js version is compatible${NC}"
echo ""

# ============================================================================
# Step 1: Build Tailwind CSS
# ============================================================================
echo -e "${YELLOW}[1/5] Building Tailwind CSS...${NC}"

cd "$PROJECT_ROOT"

if ! npm run tailwind:build; then
    echo -e "${RED}✗ Tailwind build failed${NC}"
    exit 1
fi

# Verify CSS was built
if [ ! -f "$PROJECT_ROOT/public/css/tailwind.css" ]; then
    echo -e "${RED}✗ tailwind.css not found after build${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Tailwind CSS built successfully${NC}"
echo ""

# ============================================================================
# Step 2: Clean deploy directory
# ============================================================================
echo -e "${YELLOW}[2/5] Cleaning deploy directory...${NC}"

if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
    echo -e "${GREEN}✓ Old deploy directory removed${NC}"
else
    echo -e "${GREEN}✓ No existing deploy directory${NC}"
fi

mkdir -p "$DEPLOY_DIR"
echo -e "${GREEN}✓ Fresh deploy directory created${NC}"
echo ""

# ============================================================================
# Step 3: Copy production files
# ============================================================================
echo -e "${YELLOW}[3/5] Copying production files...${NC}"

# Create directory structure
mkdir -p "$DEPLOY_DIR/css"
mkdir -p "$DEPLOY_DIR/js"
mkdir -p "$DEPLOY_DIR/partials"
mkdir -p "$DEPLOY_DIR/assets/icons"

# Copy HTML files (root level)
echo "  → Copying HTML files..."
cp "$PROJECT_ROOT"/*.html "$DEPLOY_DIR/" 2>/dev/null || true

# Copy CSS (built file only)
echo "  → Copying CSS..."
cp "$PROJECT_ROOT/public/css/tailwind.css" "$DEPLOY_DIR/css/"

# Copy JavaScript
echo "  → Copying JavaScript..."
cp "$PROJECT_ROOT/public/js"/*.js "$DEPLOY_DIR/js/"

# Copy partials
echo "  → Copying partials..."
cp "$PROJECT_ROOT/public/partials"/*.html "$DEPLOY_DIR/partials/"

# Copy assets (if any exist)
if [ -d "$PROJECT_ROOT/assets/icons" ] && [ "$(ls -A "$PROJECT_ROOT/assets/icons" 2>/dev/null)" ]; then
    echo "  → Copying assets..."
    cp -r "$PROJECT_ROOT/assets/icons"/* "$DEPLOY_DIR/assets/icons/" 2>/dev/null || true
else
    echo "  → No assets to copy"
fi

# Copy Functions directory
echo "  → Copying Functions..."
mkdir -p "$DEPLOY_DIR/functions"
cp -r "$PROJECT_ROOT/functions"/* "$DEPLOY_DIR/functions/"

# Copy node_modules with Functions dependencies only
echo "  → Copying Functions dependencies..."
mkdir -p "$DEPLOY_DIR/node_modules/@tsndr"
mkdir -p "$DEPLOY_DIR/node_modules/bcryptjs"
cp -r "$PROJECT_ROOT/node_modules/@tsndr/cloudflare-worker-jwt" "$DEPLOY_DIR/node_modules/@tsndr/" 2>/dev/null || true
cp -r "$PROJECT_ROOT/node_modules/bcryptjs" "$DEPLOY_DIR/node_modules/" 2>/dev/null || true

echo -e "${GREEN}✓ All production files copied${NC}"
echo ""

# ============================================================================
# Step 4: Validate deployment structure
# ============================================================================
echo -e "${YELLOW}[4/5] Validating deployment structure...${NC}"

ERRORS=0

# Check required files
REQUIRED_FILES=(
    "index.html"
    "lakes.html"
    "lake.html"
    "discussions.html"
    "leaderboards.html"
    "profile.html"
    "css/tailwind.css"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$DEPLOY_DIR/$file" ]; then
        echo -e "${RED}  ✗ Missing: $file${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check required directories
REQUIRED_DIRS=(
    "js"
    "partials"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$DEPLOY_DIR/$dir" ]; then
        echo -e "${RED}  ✗ Missing directory: $dir${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Validation failed with $ERRORS error(s)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required files and directories present${NC}"
echo ""

# ============================================================================
# Step 5: Display summary
# ============================================================================
echo -e "${YELLOW}[5/5] Deployment summary...${NC}"

FILE_COUNT=$(find "$DEPLOY_DIR" -type f | wc -l)
DEPLOY_SIZE=$(du -sh "$DEPLOY_DIR" 2>/dev/null | cut -f1)

echo -e "  Total files: ${GREEN}$FILE_COUNT${NC}"
echo -e "  Total size:  ${GREEN}$DEPLOY_SIZE${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Deployment preparation complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Review files in ${BLUE}deploy/${NC} directory"
echo -e "  2. Run ${BLUE}npm run deploy:push${NC} to deploy to Cloudflare"
echo -e "  3. Or run ${BLUE}npm run deploy${NC} to prepare + deploy in one command"
echo ""
