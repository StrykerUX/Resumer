#!/bin/bash

# Deploy script for DokPloy
echo "🚀 Starting CV Resumer deployment..."

# Set environment
export NODE_ENV=production
export PORT=3001

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend && npm run build
cd ..

# Build backend  
echo "🏗️ Building backend..."
cd backend && npm run build
cd ..

# Start application
echo "🚀 Starting application..."
cd backend && npm start