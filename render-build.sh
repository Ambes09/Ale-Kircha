#!/bin/bash
# RENDER BUILD SCRIPT

echo "🚀 Installing pnpm..."
npm install -g pnpm@9.0.0

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building API..."
cd apps/api
pnpm run build

echo "🔨 Building Customer Bot..."
cd ../customer-bot
pnpm run build

echo "🔨 Building Admin Bot..."
cd ../admin-bot
pnpm run build

echo "🔨 Building Web App..."
cd ../customer-web
pnpm run build

echo "✅ Build complete!"
