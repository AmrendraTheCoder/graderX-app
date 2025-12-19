#!/bin/bash

# GraderX Development Server Startup Script
echo "🚀 Starting GraderX Development Environment..."

# Check if Supabase is running
echo "📊 Checking Supabase status..."
if ! supabase status > /dev/null 2>&1; then
    echo "⚠️  Supabase is not running. Starting Supabase..."
    supabase start
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start Supabase. Please check Docker is running."
        exit 1
    fi
fi

echo "✅ Supabase is running"

# Set environment variables for local development
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

echo "🌐 Starting Next.js development server..."
echo "📱 Application will be available at: http://localhost:3000"
echo "🔧 Supabase Studio available at: http://127.0.0.1:54323"
echo ""

# Start the development server
npm run dev 