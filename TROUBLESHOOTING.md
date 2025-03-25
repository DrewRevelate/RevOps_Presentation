# Full Throttle Presentation Troubleshooting Guide

This guide provides solutions for common issues you might encounter with the Full Throttle Revenue Presentation.

## Quick Fixes

For automatic fixes to common issues, run:

```bash
./fix-issues.sh
```

For deployment to Vercel:

```bash
./deploy.sh
```

## Known Issues and Solutions

### 1. iframe Loading Issues

**Problem:** The iframe that displays slides is not loading properly.

**Symptoms:**
- The loading screen stays visible indefinitely
- Error messages appear instead of slides
- The diagnostic tool reports "iframe tag appears to be missing"

**Solutions:**
- The iframe is created dynamically with JavaScript, so it won't appear in the HTML source code. This is expected behavior.
- If the iframe isn't loading:
  - Check browser console for JavaScript errors
  - Verify that the file path to the first slide (`public/01-introduction.html`) is correct
  - Make sure all sandbox attributes are properly set:
  ```javascript
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation');
  ```
  - Try accessing the first slide directly at http://localhost:3000/public/01-introduction.html

### 2. Supabase Database Issues

**Problem:** The Supabase database integration is not working properly.

**Symptoms:**
- Console errors about missing functions or tables
- "Could not find the function public.exec_sql(sql)" error
- Poll functionality not working
- The diagnostic tool reports "Supabase reference appears to be missing"

**Solutions:**
- Verify Supabase credentials in both `.env` file and `vercel.json`
- Use direct SQL instead of the RPC call (the updated code already implements this)
- Add proper error handling for database operations (also implemented)
- Create necessary tables in your Supabase project:
  - presentation_logs
  - poll_responses
  - presentation_feedback
- Restart the server after making changes to database code

### 3. Port 3000 Already in Use

**Problem:** The server fails to start because port 3000 is already in use.

**Symptoms:**
- Error message: "listen EADDRINUSE: address already in use :::3000"
- Server crashes on startup

**Solutions:**
- Find the process using port 3000:
  ```bash
  lsof -i :3000
  ```
- Kill the process:
  ```bash
  kill -9 <PID>
  ```
- Alternatively, change the port in server.js:
  ```javascript
  const port = process.env.PORT || 3001; // Change from 3000 to another port
  ```

### 4. Production Deployment Issues

**Problem:** The production site at fullthrottle.revelateops.com returns a 404 error.

**Symptoms:**
- "404 Not Found" error when accessing the production URL
- Missing files in the deployed version

**Solutions:**
- Verify the Vercel configuration in `vercel.json`
- Ensure all routes are properly configured
- Deploy using the provided script:
  ```bash
  ./deploy.sh
  ```
- Check Vercel dashboard for deployment errors
- Add the custom domain in Vercel dashboard under Settings > Domains
- Verify DNS settings for the domain

### 5. Resource Loading Issues

**Problem:** CSS, JavaScript, or image files fail to load.

**Symptoms:**
- Unstyled content
- Missing images
- JavaScript functionality not working

**Solutions:**
- Check file paths for absolute vs. relative paths
- Verify that the server is correctly serving static files
- Check server logs for 404 errors on specific files
- Ensure that the Vercel configuration includes rules for all resource types:
  ```json
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "public/**", "use": "@vercel/static" },
    { "src": "styles.css", "use": "@vercel/static" },
    { "src": "images/**", "use": "@vercel/static" },
    { "src": "index.html", "use": "@vercel/static" }
  ]
  ```

## Advanced Troubleshooting

### Debugging Server-side Issues

If you're experiencing server-side issues:

1. Run the server with additional logging:
   ```bash
   NODE_DEBUG=* node server.js
   ```

2. Check server logs for specific errors:
   ```bash
   tail -f server.log
   ```

3. Test individual API endpoints directly:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Debugging Client-side Issues

For client-side issues:

1. Use browser developer tools (F12) to:
   - Check the Console tab for JavaScript errors
   - Inspect Network requests for failed resources
   - Verify DOM structure in the Elements tab

2. Test with iframe sandbox attributes:
   ```html
   <iframe src="public/01-introduction.html" sandbox="allow-scripts allow-same-origin"></iframe>
   ```

3. Create a simple test file to isolate issues:
   ```html
   <!-- test.html -->
   <!DOCTYPE html>
   <html>
   <head>
       <link rel="stylesheet" href="styles.css">
   </head>
   <body>
       <h1>Test Page</h1>
       <iframe src="public/01-introduction.html"></iframe>
   </body>
   </html>
   ```

## Getting More Help

If you continue to experience issues:

- Check the GitHub repository issues: https://github.com/DrewRevelate/RevOps_Presentation/issues
- Create a new issue with detailed information about the problem
- Contact drew@revelateops.com for direct assistance
