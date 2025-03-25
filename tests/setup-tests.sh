#!/bin/bash
# Setup script for FullThrottle presentation tests

echo "🚀 Setting up test environment for FullThrottle presentation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing test dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️ Creating sample .env file. Please update with your actual credentials."
    cat > .env << EOL
SUPABASE_URL=https://zdnmzumoccwagafxtnld.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8
EOL
    echo "✅ Sample .env file created. Please edit it with your actual Supabase credentials."
else
    echo "✅ .env file already exists."
fi

echo "🧪 Running a quick test of the Supabase connection..."
node supabase-tests.js

echo "🏁 Setup complete! You can now run tests with:"
echo "  npm test          # Run all tests"
echo "  npm run test:presentation  # Test presentation only"
echo "  npm run test:supabase      # Test Supabase integration only"
echo "  npm run test:vercel        # Test Vercel deployment only"
