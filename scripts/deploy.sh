#!/bin/bash

# Fathom MCP Server Deployment Script

echo "🚀 Deploying Fathom MCP Server to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with your FATHOM_API_KEY"
    echo "   Copy .env.example to .env.local and add your API key"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add FATHOM_API_KEY environment variable in Vercel dashboard"
echo "2. Test your MCP server endpoint"
echo "3. Configure your MCP client (Claude Desktop, Cursor, etc.)"
echo ""
echo "🔗 Your MCP server will be available at: https://your-app.vercel.app/api/mcp"
