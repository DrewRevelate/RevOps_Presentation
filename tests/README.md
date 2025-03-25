# Full Throttle Revenue Presentation Tests

This directory contains automated tests for the Full Throttle Revenue presentation, focusing on:
- Basic navigation functionality
- Supabase database integration
- Poll functionality
- Responsive design
- Vercel deployment

## Setup

1. Install dependencies:
```bash
cd tests
npm install
```

2. Create a `.env` file in the `tests` directory with your Supabase credentials:
```
SUPABASE_URL=zdnmzumoccwagafxtnld.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8
```

3. Make sure the local server is running for local tests:
```bash
cd ..  # Go back to main project directory
npm run dev
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test suites:

1. Test presentation functionality (navigation, polls, responsive design):
```bash
npm run test:presentation
```

2. Test Supabase integration:
```bash
npm run test:supabase
```

3. Test Vercel deployment:
```bash
npm run test:vercel
```

## Test Descriptions

### Presentation Tests (`presentation-tests.js`)
- Basic navigation through all slides
- Poll container visibility and interaction
- Poll submission and results display
- Responsive design across different screen sizes

### Supabase Tests (`supabase-tests.js`)
- Connection to Supabase
- Required tables existence check
- Poll definitions and options verification
- Poll response submission and retrieval

### Vercel Deployment Tests (`vercel-deployment-test.js`)
- Live site accessibility
- Static asset loading
- API endpoints functionality
- Visual screenshots for review

## Test Results

Tests will output results to the console and save some artifacts:
- Screenshots of different viewport sizes in the tests directory
- `test-results.json` with detailed test outcomes

## Troubleshooting

If you encounter issues:

1. **Supabase URL Format Error**:
   - Ensure your Supabase URL in the `.env` file includes the `https://` prefix
   - Example: `SUPABASE_URL=https://zdnmzumoccwagafxtnld.supabase.co`
   - If you see `TypeError: Invalid URL`, this is almost always the cause

2. **Puppeteer Browser Launch Issues**:
   - If you get a timeout waiting for WS endpoint, try:
     - Updating Node.js to the latest version
     - Installing Chrome if not already installed
     - Running with explicit Chrome path: `PUPPETEER_EXECUTABLE_PATH=/path/to/chrome npm test`
   - On macOS, you might need to allow script execution: `xattr -d com.apple.quarantine node_modules/puppeteer/.local-chromium/*/chrome-mac/Chromium.app`

3. **Database Connection Failures**:
   - Verify your Supabase credentials in the `.env` file
   - Run `node ../test-supabase.js` to test the connection separately

4. **Missing Tables**:
   - If database tables don't exist, run the setup script:
   ```bash
   node ../db/seed.js
   ```

5. **Local Server Issues**:
   - Ensure the local server is running on port 3000
   - Check `BASE_URL` in each test file if your server uses a different port

6. **Vercel Deployment Tests Failing**:
   - Verify the deployment URL in `vercel-deployment-test.js`
   - Check if the site is actually deployed and accessible

7. **Node.js Version Compatibility**:
   - These tests work best with Node.js v16-18
   - For newer Node.js versions, you might need to update Puppeteer: `npm install puppeteer@latest`

## Pre-Presentation Checklist

Run these tests before your presentation on March 26-27, 2025:

1. Run Supabase tests to ensure database connection is working
2. Run local presentation tests to verify all functionality works
3. Deploy to Vercel and run deployment tests
4. Manually inspect the screenshots for any visual issues
