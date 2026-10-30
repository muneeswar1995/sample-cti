#!/usr/bin/env bash
# set -e

# ==============================================================================
# React Native Android Release Build Script
# Usage: ./build-release.sh [--clean]
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"

echo "=================================================="
echo "🚀 Building React Native Android Release APK"
echo "📂 Project Directory: $SCRIPT_DIR"
echo "=================================================="

# Check if android folder exists
if [ ! -d "$ANDROID_DIR" ]; then
  echo "❌ Error: Android folder not found at $ANDROID_DIR"
  exit 1
fi

cd "$ANDROID_DIR"

# Clean build if --clean flag is provided
if [ "$1" == "--clean" ]; then
  echo "🧹 Cleaning previous build artifacts..."
  ./gradlew clean
fi

# Run Gradle release build
echo "⚙️  Running ./gradlew assembleRelease..."
./gradlew assembleRelease

APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  FILE_SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo ""
  echo "=================================================="
  echo "✅ BUILD SUCCESSFUL!"
  echo "📦 Release APK Location: $APK_PATH"
  echo "📊 File Size: $FILE_SIZE"
  echo "=================================================="
  echo ""
  echo "💡 To install onto connected device/emulator:"
  echo "   adb install -r \"$APK_PATH\""
else
  echo "❌ Error: Release APK was not found at expected location: $APK_PATH"
  exit 1
fi
