#!/bin/bash

# Archive 99 Setup Script

echo "🧥 Setting up Archive 99..."

# 1. Install Dependencies
echo "📦 Installing pnpm dependencies..."
pnpm install

# 2. Environment Check
if [ ! -f "apps/backend/.env" ]; then
    echo "⚠️  apps/backend/.env not found!"
    echo "Please create it using the template in docs/07-setup.md"
    exit 1
fi

# 3. Database Migration
echo "🗄️  Pushing Database Schema..."
pnpm --filter backend db:push

# 4. Seeding
echo "🌱 Seeding Database (Products + Vectors)..."
pnpm --filter backend seed

echo "✅ Setup Complete!"
echo "🚀 Run 'pnpm dev' to start the application."
