#!/usr/bin/env bash
# set -e

# ==============================================================================
# React Native iOS Release Build Script
# Usage: ./build-ios.sh [--clean]
# Note: iOS builds can only be compiled on macOS with Xcode installed.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"

echo "=================================================="
echo "🚀 Building React Native iOS Package (.ipa)"
echo "📂 Project Directory: $SCRIPT_DIR"
echo "=================================================="

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo ""
  echo "❌ Error: iOS apps can ONLY be compiled on macOS (with Xcode installed)."
  echo "   Current OS: $OSTYPE"
  echo ""
  echo "💡 How to build for iOS from Windows:"
  echo "   1. Push a git release tag (e.g. ./release-tag.sh v1.0.0)"
  echo "   2. GitHub Actions will automatically compile the iOS .ipa in the cloud"
  echo "      using a cloud macOS runner and attach it to your GitHub Release!"
  echo "=================================================="
  exit 1
fi

# Check if xcodebuild is installed
if ! command -v xcodebuild &> /dev/null; then
  echo "❌ Error: xcodebuild is not installed or not in PATH. Please install Xcode."
  exit 1
fi

# Check if ios folder exists
if [ ! -d "$IOS_DIR" ]; then
  echo "❌ Error: iOS folder not found at $IOS_DIR"
  exit 1
fi

cd "$IOS_DIR"

# Clean previous build artifacts if requested
if [ "$1" == "--clean" ]; then
  echo "🧹 Cleaning previous iOS build artifacts..."
  rm -rf build/
  rm -rf Pods/
  rm -f Podfile.lock
fi

# Ensure CocoaPods are installed
if [ ! -d "Pods" ]; then
  echo "📦 Installing CocoaPods dependencies..."
  pod install
fi

echo "⚙️  Building iOS Archive..."
xcodebuild archive \
  -workspace cs_managment.xcworkspace \
  -scheme cs_managment \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/cs_managment.xcarchive \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO

echo "📦 Packaging into .ipa..."
rm -rf build/Payload
mkdir -p build/Payload
cp -r build/cs_managment.xcarchive/Products/Applications/cs_managment.app build/Payload/

cd build
zip -qr cs-mobile-app.ipa Payload
IPA_PATH="$IOS_DIR/build/cs-mobile-app.ipa"

if [ -f "$IPA_PATH" ]; then
  FILE_SIZE=$(du -h "$IPA_PATH" | cut -f1)
  echo ""
  echo "=================================================="
  echo "✅ BUILD SUCCESSFUL!"
  echo "📦 Release IPA Location: $IPA_PATH"
  echo "📊 File Size: $FILE_SIZE"
  echo "=================================================="
  echo ""
  echo "💡 To install onto an Apple iPhone:"
  echo "   - Upload to Apple TestFlight (for over-the-air distribution)"
  echo "   - Or install via Sideloadly / AltStore / Apple Configurator"
else
  echo "❌ Error: Release IPA was not found at expected location: $IPA_PATH"
  exit 1
fi
