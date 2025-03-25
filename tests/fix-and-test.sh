#!/bin/bash
# Fix common issues and run tests
echo "🚀 Full Throttle Presentation Test Helper"
echo "========================================"

# Check if local server is running
echo "🔍 Checking if local server is running..."
if curl --output /dev/null --silent --head --fail http://localhost:3000; then
  echo "✅ Local server is running on port 3000"
else
  echo "❌ Local server is not running!"
  echo "   Please start the server in another terminal with:"
  echo "   cd /Users/drewlambert/Desktop/Projects/FullThrottle_Final"
  echo "   npm run dev"
  echo ""
  echo "Would you like to start the server now? (y/n)"
  read -r start_server
  if [[ "$start_server" =~ ^[Yy]$ ]]; then
    echo "Starting server in background..."
    cd .. && npm run dev &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    echo "Waiting 5 seconds for server to initialize..."
    sleep 5
  else
    echo "Please start the server manually before running tests"
  fi
fi

# Fix Supabase URL if needed
if grep -q "SUPABASE_URL=zdnmzumoccwagafxtnld.supabase.co" .env 2>/dev/null; then
  echo "⚠️ Fixing Supabase URL format in .env file..."
  sed -i.bak 's#SUPABASE_URL=zdnmzumoccwagafxtnld.supabase.co#SUPABASE_URL=https://zdnmzumoccwagafxtnld.supabase.co#g' .env
  echo "✅ Updated Supabase URL to include https:// prefix"
fi

# Fix Puppeteer Chrome permissions on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🔍 Checking Puppeteer permissions on macOS..."
  CHROME_APP_PATH="node_modules/puppeteer/.local-chromium/*/chrome-mac/Chromium.app"
  
  if ls $CHROME_APP_PATH >/dev/null 2>&1; then
    echo "⚠️ Fixing Chrome permissions..."
    xattr -d com.apple.quarantine $CHROME_APP_PATH 2>/dev/null || echo "   (No permission changes needed)"
    echo "✅ Chrome permissions updated"
  else
    echo "ℹ️ No Puppeteer Chrome installation found yet"
  fi
fi

# Check for Node.js version compatibility
NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge "20" ]; then
  echo "⚠️ You're using Node.js v$NODE_VERSION. These tests work best with Node.js v16-18."
  echo "   If you encounter issues, consider updating Puppeteer:"
  echo "   npm install puppeteer@latest"
fi

# Run Chrome diagnostic tool
echo "🔍 Running Chrome diagnostic check..."
node check-puppeteer.js

# Run Supabase connection test
echo "🔍 Testing Supabase connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
console.log('URL:', url);
console.log('Key:', key ? key.substring(0, 8) + '...' : 'missing');
if (!url || !key) {
  console.log('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}
const supabase = createClient(url, key);
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Supabase connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Unexpected error:', err.message);
    process.exit(1);
  });
"

# Ask if user wants to run tests
echo ""
echo "Ready to run the tests? (y/n)"
read -r answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
  echo "🚀 Running tests..."
  npm test
else
  echo "Tests skipped. You can run them later with 'npm test'."
fi

echo "Done! ✨"
