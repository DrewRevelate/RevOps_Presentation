#!/bin/bash

# Full Throttle Presentation Deployment Script
# This script automates the deployment process to Vercel

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏎️  FULL THROTTLE PRESENTATION DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Initializing..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "Pre-deployment update: $(date)"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Check if remote is set
if ! git remote | grep -q "origin"; then
    echo "❓ Git remote 'origin' not found."
    read -p "Enter your GitHub repository URL (e.g., https://github.com/DrewRevelate/RevOps_Presentation.git): " REPO_URL
    git remote add origin $REPO_URL
    echo "✅ Git remote 'origin' added"
else
    echo "✅ Git remote 'origin' is set"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main || git push -u origin master
echo "✅ Pushed to GitHub"

# Verify Vercel configuration
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Creating..."
    cat > vercel.json << 'EOL'
{
  "version": 2,
  "name": "full-throttle-presentation",
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "styles.css", "use": "@vercel/static" },
    { "src": "images/**", "use": "@vercel/static" },
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/styles.css", "dest": "/styles.css" },
    { "src": "/images/(.*)", "dest": "/images/$1" },
    { "src": "/public/(.*)", "dest": "/public/$1" },
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/health", "dest": "/server.js" },
    { "src": "/", "dest": "/index.html" },
    { "src": "/(.*)", "dest": "/server.js" }
  ],
  "env": {
    "VERCEL": "1",
    "SUPABASE_URL": "https://zdnmzumoccwagafxtnld.supabase.co",
    "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8",
    "NODE_ENV": "production"
  },
  "regions": ["sfo1"]
}
EOL
    echo "✅ vercel.json created"
else
    echo "✅ vercel.json exists"
fi

# Verify package.json has build command
if ! grep -q '"build"' package.json; then
    echo "❌ build script not found in package.json. Adding..."
    sed -i '' 's/"scripts": {/"scripts": {\n    "build": "npm install",/g' package.json
    echo "✅ build script added to package.json"
else
    echo "✅ build script exists in package.json"
fi

# Deploy to Vercel
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING TO VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "You will be guided through the Vercel deployment process."
echo "- When asked to set up and deploy, select 'Y'"
echo "- For the scope, select your account"
echo "- When asked if you want to link to an existing project, select 'Y' if this is a redeployment"
echo "- If asked for the project name, use 'full-throttle-presentation'"
echo "- For the directory, use './' (the current directory)"
echo ""
echo "Press any key to continue with deployment..."
read -n 1 -s

# Run Vercel deployment
vercel

# Ask if user wants to deploy to production
echo ""
echo "Do you want to deploy to production now? (y/n)"
read PROD_DEPLOY

if [[ $PROD_DEPLOY == "y" || $PROD_DEPLOY == "Y" ]]; then
    echo "Deploying to production..."
    vercel --prod
    
    echo ""
    echo "Do you want to set up the custom domain 'fullthrottle.revelateops.com'? (y/n)"
    read CUSTOM_DOMAIN
    
    if [[ $CUSTOM_DOMAIN == "y" || $CUSTOM_DOMAIN == "Y" ]]; then
        echo "Adding custom domain..."
        vercel domains add fullthrottle.revelateops.com
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏁 DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your Full Throttle Presentation has been deployed!"
echo ""
echo "Next steps:"
echo "1. Test your deployment by visiting the URL provided by Vercel"
echo "2. If you set up the custom domain, check that it's working at https://fullthrottle.revelateops.com"
echo "3. Verify that the slides are loading correctly"
echo "4. Test the interactive polling features"
echo ""
echo "If you encounter any issues, refer to the DEPLOY.md file for troubleshooting steps."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
