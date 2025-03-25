# Deployment Guide for Full Throttle Revenue Presentation

This guide provides step-by-step instructions to deploy the Full Throttle Revenue presentation to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (can be created for free at https://vercel.com)
- The Vercel CLI installed (`npm install -g vercel`)

## Deployment Steps

### 1. Push to GitHub

First, push your code to GitHub:

```bash
# Initialize Git repository if not already done
git init

# Add all files to Git
git add .

# Make initial commit
git commit -m "Initial commit: Full Throttle Revenue Presentation"

# Add GitHub remote repository
git remote add origin https://github.com/DrewRevelate/RevOps_Presentation.git

# Push to main branch
git push -u origin main
```

### 2. Deploy to Vercel

You have two options for deploying to Vercel:

#### Option 1: Using Vercel CLI

```bash
# Log in to Vercel
vercel login

# Deploy to Vercel
vercel

# Answer the prompts:
# - Set up and deploy: Yes
# - Directory: ./
# - Link to existing project: Yes
# - Select project: full-throttle-presentation

# Deploy to production
vercel --prod
```

#### Option 2: Using Vercel Web Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" > "Project"
3. Select your GitHub repository "RevOps_Presentation"
4. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm install`
   - Output Directory: ./
   - Install Command: `npm install`
5. Add environment variables (should be pre-filled from vercel.json):
   - VERCEL: 1
   - SUPABASE_URL: https://zdnmzumoccwagafxtnld.supabase.co
   - SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8
   - NODE_ENV: production
6. Click "Deploy"

### 3. Set up Custom Domain

To use the fullthrottle.revelateops.com domain:

1. Go to your project on the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add domain: fullthrottle.revelateops.com
4. Follow the instructions to verify domain ownership
5. Configure DNS settings as directed by Vercel

### 4. Verify Deployment

Once deployed, verify that:

1. The main site loads at https://fullthrottle.revelateops.com
2. The iframe loads correctly and shows the first slide
3. Slide navigation works properly
4. Supabase connection is working (check console logs)

## Troubleshooting

If you encounter any issues:

### Problem: 404 Not Found
- Check that all build settings are correct in Vercel
- Verify that vercel.json contains the correct routes
- Make sure index.html is being properly served as the root

### Problem: Iframe not loading
- Check browser console for errors
- Verify that the sandbox attribute is properly set
- Try accessing the first slide directly at /public/01-introduction.html

### Problem: Supabase connection errors
- Verify that environment variables are correctly set in Vercel
- Check that the tables exist in your Supabase project
- Test the connection locally before deploying

## Support

For additional help, contact:
- Email: drew@revelateops.com
- GitHub: https://github.com/DrewRevelate