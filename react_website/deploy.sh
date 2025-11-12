#!/bin/bash

# ChalkJuice S3 Deployment Script
# Usage: ./deploy.sh [bucket-name]

set -e

BUCKET_NAME=${1:-"chalkjuice-app"}

echo "🏗️  Building static site..."
npm run build

echo "📦 Syncing to S3 bucket: $BUCKET_NAME..."

# Upload static assets with long cache
aws s3 sync out/ s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json" \
  --exclude "sitemap.xml" \
  --exclude "robots.txt"

# Upload HTML/JSON with short cache
aws s3 sync out/ s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --include "sitemap.xml" \
  --include "robots.txt"

echo "✅ Deployment complete!"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
