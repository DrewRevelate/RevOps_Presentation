#!/bin/bash

# Full Throttle Presentation Issue Fixer
# This script addresses common issues with the presentation

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FULL THROTTLE PRESENTATION ISSUE FIXER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running processes are using port 3000
PORT_PROCESS=$(lsof -i :3000 -t)
if [ -n "$PORT_PROCESS" ]; then
    echo "❌ Port 3000 is in use by process ID $PORT_PROCESS"
    echo "Terminating process..."
    kill -9 $PORT_PROCESS
    echo "✅ Process terminated"
else
    echo "✅ Port 3000 is available"
fi

# Check directory structure
echo "Verifying directory structure..."
for DIR in "public" "images" "db" "db/supabase"; do
    if [ ! -d "$DIR" ]; then
        echo "❌ Directory '$DIR' not found. Creating..."
        mkdir -p "$DIR"
        echo "✅ Directory '$DIR' created"
    else
        echo "✅ Directory '$DIR' exists"
    fi
done

# Check critical files
CRITICAL_FILES=("index.html" "styles.css" "server.js" "db/supabase/database.js" "db/seed.js" "package.json" "vercel.json")

for FILE in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$FILE" ]; then
        echo "❌ Critical file '$FILE' not found!"
    else
        echo "✅ Critical file '$FILE' exists"
    fi
done

# Check slide files
echo "Checking slides in public directory..."
for i in {1..7}; do
    SLIDE=$(printf "public/%02d" $i)
    SLIDE_COUNT=$(find "public" -name "${SLIDE}*.html" | wc -l)
    
    if [ "$SLIDE_COUNT" -eq 0 ]; then
        echo "❌ No slide found for number $i"
    else
        echo "✅ Slide $i exists"
    fi
done

# Test Supabase connection
echo "Testing Supabase connection..."
NODE_TEST=$(node -e "
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zdnmzumoccwagafxtnld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8';

async function testConnection() {
    try {
        const db = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await db.from('presentation_logs').select('*').limit(1);
        
        if (error) {
            console.log('Connection test failed: ' + error.message);
            process.exit(1);
        } else {
            console.log('Connection test successful');
            process.exit(0);
        }
    } catch (err) {
        console.log('Connection test failed: ' + err.message);
        process.exit(1);
    }
}

testConnection();
" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Supabase connection test successful"
else
    echo "❌ Supabase connection test failed: $NODE_TEST"
    echo "Possible fixes:"
    echo "  - Check Supabase credentials in .env file and vercel.json"
    echo "  - Make sure the necessary tables exist in your Supabase project"
    echo "  - Check internet connectivity"
fi

# Start the server in background to test
echo "Starting server in background for testing..."
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test the server
echo "Testing local server..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$RESPONSE" -eq 200 ]; then
    echo "✅ Server is running and responding correctly"
else
    echo "❌ Server returned status $RESPONSE"
    echo "Possible fixes:"
    echo "  - Check server logs for errors"
    echo "  - Verify port 3000 is not in use by another process"
    echo "  - Restart the server manually"
fi

# Stop the test server
echo "Stopping test server..."
kill $SERVER_PID

# Check for iframe issues
echo "Checking for iframe issues in index.html..."
if grep -q "iframe" index.html; then
    echo "✅ iframe reference found in index.html"
else
    echo "⚠️ No static iframe tag found in index.html."
    echo "This is normal if the iframe is created dynamically with JavaScript."
    echo "Verify the JavaScript function that creates the iframe is working properly."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏁 ISSUE CHECK COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If you want to deploy the presentation to Vercel, run:"
echo "./deploy.sh"
echo ""
echo "To start the server for local development, run:"
echo "npm run dev"
echo ""
echo "For more detailed instructions, see README.md and DEPLOY.md."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
