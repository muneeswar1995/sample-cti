#!/usr/bin/env bash
set -e

# ==============================================================================
# GitHub Release Tagging Script
# Usage: ./release-tag.sh [tag_version] [message]
# Example: ./release-tag.sh v1.0.0 "Initial Release 1.0.0"
# ==============================================================================

TAG="$1"
MSG="$2"

if [ -z "$TAG" ]; then
  echo "❌ Error: Tag version is required."
  echo ""
  echo "Usage:"
  echo "  ./release-tag.sh <tag_version> [message]"
  echo ""
  echo "Examples:"
  echo "  ./release-tag.sh v1.0.0"
  echo "  ./release-tag.sh v1.0.0 \"Release version 1.0.0\""
  exit 1
fi

# Ensure tag starts with 'v' or 'mobile-v'
if [[ ! "$TAG" =~ ^v[0-9] ]] && [[ ! "$TAG" =~ ^mobile-v[0-9] ]]; then
  echo "⚠️ Warning: Tag '$TAG' does not follow 'v*' format. Setting to 'v$TAG'..."
  TAG="v$TAG"
fi

if [ -z "$MSG" ]; then
  MSG="Release $TAG"
fi

echo "=================================================="
echo "🏷️  Creating & Pushing Release Tag: $TAG"
echo "💬 Message: $MSG"
echo "=================================================="

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  You have uncommitted changes in your repository."
  read -p "Do you want to commit all changes before creating tag? (y/n): " CONFIRM_COMMIT
  if [[ "$CONFIRM_COMMIT" =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "chore: prepare for $TAG"
  fi
fi

# Create annotated tag
echo "📌 Creating git tag: $TAG..."
git tag -a "$TAG" -m "$MSG"

# Push tag to remote
echo "🚀 Pushing tag '$TAG' to origin..."
git push origin "$TAG"

echo ""
echo "=================================================="
echo "🎉 Tag '$TAG' pushed successfully!"
echo "📡 GitHub Actions workflow will now build & create the GitHub Release automatically."
echo "🔗 Check progress under the 'Actions' tab in your GitHub repository."
echo "=================================================="
