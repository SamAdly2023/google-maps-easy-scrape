#!/bin/bash
# Build script for Chrome Extension packaging
# This script prepares the extension for Chrome Web Store submission

echo "🎨 MapLeads AI - Extension Packaging Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_DIR="./google-maps-easy-scrape"
EXTENSION_NAME="mapleads-ai-extension"
VERSION=$(grep '"version"' $EXTENSION_DIR/manifest.json | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
OUTPUT_ZIP="${EXTENSION_NAME}-${VERSION}.zip"

echo -e "${YELLOW}Step 1: Validating Extension Files${NC}"
echo "-----------------------------------"

# Check required files
required_files=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "background.js"
    "content.js"
    "images/icon-16.png"
    "images/icon-48.png"
    "images/icon-128.png"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$EXTENSION_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file - MISSING"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "\n${RED}Error: Some required files are missing!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Validating manifest.json${NC}"
echo "--------------------------------"

# Check if manifest.json is valid JSON (basic check)
if grep -q '"manifest_version"' "$EXTENSION_DIR/manifest.json"; then
    echo -e "${GREEN}✓${NC} manifest.json is valid"
else
    echo -e "${RED}✗${NC} manifest.json appears invalid"
    exit 1
fi

# Show current version
echo -e "${GREEN}✓${NC} Version: $VERSION"

echo ""
echo -e "${YELLOW}Step 3: Checking Icon Sizes${NC}"
echo "----------------------------"

# Check icon sizes (requires ImageMagick)
if command -v identify &> /dev/null; then
    for size in 16 48 128 256; do
        icon="$EXTENSION_DIR/images/icon-${size}.png"
        if [ -f "$icon" ]; then
            actual_size=$(identify -format "%wx%h" "$icon")
            if [[ "$actual_size" == "${size}x${size}" ]]; then
                echo -e "${GREEN}✓${NC} icon-${size}.png: ${actual_size}"
            else
                echo -e "${YELLOW}⚠${NC} icon-${size}.png: Expected ${size}x${size}, got $actual_size"
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} ImageMagick not installed, skipping icon size validation"
fi

echo ""
echo -e "${YELLOW}Step 4: Creating ZIP Package${NC}"
echo "-----------------------------"

# Create temporary directory for clean build
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/$EXTENSION_NAME"

echo "Copying files to temporary directory..."

# Copy all necessary files
cp "$EXTENSION_DIR/manifest.json" "$TEMP_DIR/$EXTENSION_NAME/"
cp "$EXTENSION_DIR/popup.html" "$TEMP_DIR/$EXTENSION_NAME/"
cp "$EXTENSION_DIR/popup.js" "$TEMP_DIR/$EXTENSION_NAME/"
cp "$EXTENSION_DIR/background.js" "$TEMP_DIR/$EXTENSION_NAME/"
cp "$EXTENSION_DIR/content.js" "$TEMP_DIR/$EXTENSION_NAME/"

# Copy optional files if they exist
[ -f "$EXTENSION_DIR/client.html" ] && cp "$EXTENSION_DIR/client.html" "$TEMP_DIR/$EXTENSION_NAME/"
[ -f "$EXTENSION_DIR/admin.html" ] && cp "$EXTENSION_DIR/admin.html" "$TEMP_DIR/$EXTENSION_NAME/"
[ -f "$EXTENSION_DIR/sidebar.html" ] && cp "$EXTENSION_DIR/sidebar.html" "$TEMP_DIR/$EXTENSION_NAME/"
[ -f "$EXTENSION_DIR/sidebar.js" ] && cp "$EXTENSION_DIR/sidebar.js" "$TEMP_DIR/$EXTENSION_NAME/"
[ -f "$EXTENSION_DIR/sidebar.css" ] && cp "$EXTENSION_DIR/sidebar.css" "$TEMP_DIR/$EXTENSION_NAME/"

# Copy directories
cp -r "$EXTENSION_DIR/images" "$TEMP_DIR/$EXTENSION_NAME/"
[ -d "$EXTENSION_DIR/styles" ] && cp -r "$EXTENSION_DIR/styles" "$TEMP_DIR/$EXTENSION_NAME/"

# Create ZIP file
cd "$TEMP_DIR"
zip -r "$OUTPUT_ZIP" "$EXTENSION_NAME" > /dev/null 2>&1
ZIP_SIZE=$(ls -lh "$OUTPUT_ZIP" | awk '{print $5}')

# Copy ZIP to current directory
cp "$OUTPUT_ZIP" - > "../../$OUTPUT_ZIP" 2>/dev/null || cp "$OUTPUT_ZIP" "../../$OUTPUT_ZIP"

cd - > /dev/null

# Cleanup
rm -rf "$TEMP_DIR"

if [ -f "$OUTPUT_ZIP" ]; then
    echo -e "${GREEN}✓${NC} ZIP created: $OUTPUT_ZIP ($ZIP_SIZE)"
else
    echo -e "${RED}✗${NC} Failed to create ZIP file"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Verifying ZIP Contents${NC}"
echo "-------------------------------"

# List ZIP contents
echo "Contents of $OUTPUT_ZIP:"
unzip -l "$OUTPUT_ZIP" | head -20

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Extension Package Created Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

echo ""
echo "📦 Package Information:"
echo "  Name: $OUTPUT_ZIP"
echo "  Size: $ZIP_SIZE"
echo "  Version: $VERSION"
echo ""
echo "🚀 Next Steps:"
echo "  1. Upload $OUTPUT_ZIP to Chrome Web Store"
echo "  2. Verify Privacy Policy URL is live"
echo "  3. Fill in extension details"
echo "  4. Submit for review"
echo ""
echo "📋 Chrome Web Store URL:"
echo "  https://chrome.google.com/webstore/devconsole"
echo ""
echo "📖 Privacy Policy URL:"
echo "  https://mapleads-ai.render.com/privacy-policy.html"
echo ""
