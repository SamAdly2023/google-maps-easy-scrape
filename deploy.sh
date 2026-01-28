#!/usr/bin/env bash

# 🚀 MapLeads AI - Complete Deployment Script
# This script handles the entire deployment process:
# 1. Local testing and verification
# 2. Building extension package
# 3. Deploying to Render
# 4. Verifying live deployment

set -e  # Exit on error

echo "=========================================="
echo "🚀 MapLeads AI - Complete Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
RENDER_DOMAIN="mapleads-ai"  # Change to your custom domain if needed
PRIVACY_POLICY_URL=""

# Helper functions
log_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Local Testing
log_step "Step 1: Testing Locally"
echo ""

if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_error "package.json not found. Run from project root."
    exit 1
fi

log_success "Node.js found: $(node --version)"

# Install dependencies
if [ ! -d "node_modules" ]; then
    log_warning "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
else
    log_success "Dependencies already installed"
fi

# Check for required files
log_warning "Checking for required files..."
required_files=(
    "server.js"
    "services/analytics.js"
    "middleware/metrics.js"
    "google-maps-easy-scrape/manifest.json"
    "public/privacy-policy.html"
)

all_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Found: $file"
    else
        log_error "Missing: $file"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo ""
    log_error "Some required files are missing!"
    exit 1
fi

echo ""

# Step 2: Build Extension Package
log_step "Step 2: Building Extension Package"
echo ""

if [ -f "build-extension.sh" ]; then
    chmod +x build-extension.sh
    ./build-extension.sh
    log_success "Extension package built"
else
    log_warning "build-extension.sh not found, skipping automated packaging"
    echo "To package manually:"
    echo "  cd google-maps-easy-scrape"
    echo "  zip -r ../mapleads-ai-extension.zip ."
fi

echo ""

# Step 3: Verify Render Configuration
log_step "Step 3: Verifying Render Configuration"
echo ""

if [ ! -f "render.yaml" ]; then
    log_warning "render.yaml not found, will use defaults"
else
    log_success "render.yaml found"
    if grep -q "mapleads-ai\|FIREBASE_PROJECT_ID" render.yaml; then
        log_success "render.yaml appears configured"
    else
        log_warning "render.yaml may need configuration"
    fi
fi

if [ ! -f ".env.production" ] && [ -z "$FIREBASE_PROJECT_ID" ]; then
    log_warning "No .env.production file found"
    echo "Render will use environment variables from dashboard"
fi

echo ""

# Step 4: Deployment Instructions
log_step "Step 4: Deployment Instructions"
echo ""

echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  PREPARE RENDER (if not already done):"
echo "   • Go to: https://render.com"
echo "   • Create account (use GitHub)"
echo "   • Create New Web Service"
echo "   • Connect your GitHub repository"
echo ""
echo "2️⃣  SET ENVIRONMENT VARIABLES:"
echo "   Go to Render Dashboard > Environment:"
echo ""
cat << 'EOF'
   NODE_ENV = production
   PORT = 5000
   LOG_LEVEL = info
   FIREBASE_PROJECT_ID = [your-project-id]
   FIREBASE_PRIVATE_KEY = [your-private-key]
   FIREBASE_CLIENT_EMAIL = [your-client-email]
   FIREBASE_DATABASE_URL = [your-database-url]
   ALLOWED_ORIGINS = https://mapleads-ai.render.com
EOF
echo ""
echo "3️⃣  DEPLOY TO RENDER:"
echo "   • Push code to GitHub:"
echo "     git add ."
echo "     git commit -m 'Deploy to Render'"
echo "     git push origin main"
echo ""
echo "   • Render auto-deploys (watch Logs tab)"
echo "   • Deployment takes ~2-3 minutes"
echo ""
echo "4️⃣  VERIFY LIVE DEPLOYMENT:"
echo "   • Check status: https://mapleads-ai.render.com/health"
echo "   • View metrics: https://mapleads-ai.render.com/api/metrics"
echo "   • Admin dash: https://mapleads-ai.render.com/admin/analytics.html"
echo "   • Privacy policy: https://mapleads-ai.render.com/privacy-policy.html"
echo ""
echo "5️⃣  PUBLISH EXTENSION TO CHROME WEB STORE:"
echo "   • Go to: https://chrome.google.com/webstore/devconsole"
echo "   • Create Developer Account (costs \$5)"
echo "   • Upload ZIP: mapleads-ai-extension-1.0.0.zip"
echo "   • Fill in extension details"
echo "   • Privacy Policy URL: https://mapleads-ai.render.com/privacy-policy.html"
echo "   • Submit for review (1-24 hours)"
echo ""
echo "📚 DOCUMENTATION:"
echo "   • Render Guide: RENDER_DEPLOYMENT_GUIDE.md"
echo "   • Extension Guide: CHROME_EXTENSION_PACKAGING.md"
echo "   • Launch Checklist: FINAL_LAUNCH_CHECKLIST.md"
echo ""

log_success "Deployment preparation complete!"
echo ""
echo "⏱️  Estimated timeline:"
echo "   • Render deployment: 2-3 minutes"
echo "   • Chrome Web Store: 1-24 hours"
echo "   • Total: 1-24 hours"
echo ""
echo "✅ Ready to launch! Follow the next steps above."
