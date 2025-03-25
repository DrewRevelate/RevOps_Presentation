#!/bin/bash

# Initialize Git repository
git init

# Add all files to Git
git add .

# Make initial commit
git commit -m "Initial commit: Full Throttle Revenue Presentation"

# Add GitHub remote repository
git remote add origin https://github.com/DrewRevelate/RevOps_Presentation.git

# Push to main branch
git push -u origin main

echo "Repository has been initialized and code has been pushed to GitHub."
echo "Next steps:"
echo "1. Deploy to Vercel using 'vercel' command"
echo "2. Set up environment variables in Vercel"
echo "3. Finalize deployment with 'vercel --prod'"