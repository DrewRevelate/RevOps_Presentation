// Vercel deployment test for Full Throttle Revenue presentation
// Tests the live site's accessibility and basic functionality

const puppeteer = require('puppeteer');

// Configuration
const LIVE_URL = 'https://fullthrottle.revelateops.com'; // Update with your Vercel deployment URL
const PRESENTATION_TIMEOUT = 60000; // 60 seconds timeout for loading pages

// Initialize test results
let passedTests = 0;
let totalTests = 0;

// Helper function to log test results
function logTest(name, passed, message) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ PASS: ${name} - ${message}`);
  } else {
    console.error(`❌ FAIL: ${name} - ${message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Running Vercel deployment tests for Full Throttle presentation');
  console.log('===============================================================');
  console.log(`Testing deployment at: ${LIVE_URL}`);
  console.log('===============================================================\n');
  
  let browser;
  
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: "new", // Use headless "new" mode for better compatibility
      defaultViewport: { width: 1366, height: 768 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      timeout: 60000, // Increase timeout to 60 seconds
      ignoreDefaultArgs: ['--disable-extensions'],
      env: { ...process.env }
    });
    
    const page = await browser.newPage();
    await page.setDefaultTimeout(PRESENTATION_TIMEOUT);
    
    // Test 1: Site accessibility
    try {
      console.log('Test 1: Checking site accessibility');
      
      // Request the main URL
      const response = await page.goto(LIVE_URL, { waitUntil: 'networkidle0' });
      
      if (!response) {
        logTest('Site Accessibility', false, 'No response received from site');
      } else {
        logTest('Site Accessibility', response.ok(), 
                response.ok() 
                ? `Site is accessible (Status: ${response.status()})` 
                : `Site returned error status: ${response.status()}`);
      }
    } catch (error) {
      logTest('Site Accessibility', false, `Error accessing site: ${error.message}`);
    }
    
    // Test 2: Site title and content
    try {
      console.log('\nTest 2: Checking site title and content');
      
      // Check title
      const title = await page.title();
      logTest('Page Title', title.includes('Full Throttle Revenue'), 
              title.includes('Full Throttle Revenue') 
              ? 'Title contains "Full Throttle Revenue"' 
              : `Unexpected title: "${title}"`);
      
      // Check for key elements
      const hasLoadingScreen = await page.evaluate(() => {
        return !!document.querySelector('#loadingScreen');
      });
      
      const hasPresentationContainer = await page.evaluate(() => {
        return !!document.querySelector('#presentationContainer');
      });
      
      logTest('Loading Screen', hasLoadingScreen, hasLoadingScreen 
              ? 'Loading screen element found' 
              : 'Loading screen element not found');
              
      logTest('Presentation Container', hasPresentationContainer, hasPresentationContainer 
              ? 'Presentation container element found' 
              : 'Presentation container element not found');
    } catch (error) {
      logTest('Site Content', false, `Error checking site content: ${error.message}`);
    }
    
    // Test 3: Navigation to first slide
    try {
      console.log('\nTest 3: Testing navigation to first slide');
      
      // Wait for loading animation to complete
      await page.waitForTimeout(3000);
      
      // Check if we're redirected to first slide or loading in container
      const currentUrl = page.url();
      const isFirstSlide = currentUrl.includes('01-introduction.html');
      
      if (isFirstSlide) {
        logTest('First Slide Redirect', true, 'Automatically redirected to first slide');
      } else {
        // Check if slide is loaded in container
        const slideLoaded = await page.evaluate(() => {
          const container = document.querySelector('#presentationContainer');
          return container && container.innerHTML.includes('main-title');
        });
        
        logTest('First Slide Loading', slideLoaded, slideLoaded 
                ? 'First slide loaded in presentation container' 
                : 'First slide not loaded in presentation container');
                
        // Try clicking through if needed
        if (!slideLoaded) {
          try {
            const startButton = await page.$('a.start-button, a.nav-button.next');
            if (startButton) {
              await startButton.click();
              await page.waitForTimeout(2000);
              
              const clickLoaded = await page.evaluate(() => {
                const container = document.querySelector('#presentationContainer');
                return container && container.innerHTML.includes('main-title');
              });
              
              logTest('First Slide Navigation', clickLoaded, clickLoaded 
                      ? 'Successfully navigated to first slide via button click' 
                      : 'Failed to navigate to first slide after button click');
            }
          } catch (clickError) {
            logTest('First Slide Navigation', false, `Error navigating to first slide: ${clickError.message}`);
          }
        }
      }
    } catch (error) {
      logTest('First Slide Navigation', false, `Error during first slide test: ${error.message}`);
    }
    
    // Test 4: Check static assets
    try {
      console.log('\nTest 4: Checking static assets');
      
      // Get all resource URLs loaded on the page
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          type: r.initiatorType,
          status: r.responseStatus
        }));
      });
      
      // Check CSS resources
      const cssResources = resources.filter(r => r.name.includes('.css') || r.initiatorType === 'css');
      logTest('CSS Resources', cssResources.length > 0, cssResources.length > 0 
              ? `Loaded ${cssResources.length} CSS resources` 
              : 'No CSS resources detected');
              
      // Check JavaScript resources
      const jsResources = resources.filter(r => r.name.includes('.js') || r.initiatorType === 'script');
      logTest('JavaScript Resources', jsResources.length > 0, jsResources.length > 0 
              ? `Loaded ${jsResources.length} JavaScript resources` 
              : 'No JavaScript resources detected');
              
      // Check for 404s or other errors
      const failedResources = resources.filter(r => r.status >= 400);
      logTest('Failed Resources', failedResources.length === 0, failedResources.length === 0 
              ? 'No failed resource requests detected' 
              : `${failedResources.length} resources failed to load`);
              
      if (failedResources.length > 0) {
        console.log('  Failed resources:');
        failedResources.forEach(res => {
          console.log(`    - ${res.name}: ${res.status}`);
        });
      }
    } catch (error) {
      logTest('Static Assets', false, `Error checking static assets: ${error.message}`);
    }
    
    // Test 5: API endpoints
    try {
      console.log('\nTest 5: Testing API endpoints');
      
      // Test health endpoint
      try {
        const healthResponse = await page.goto(`${LIVE_URL}/health`, { waitUntil: 'networkidle0' });
        
        if (!healthResponse) {
          logTest('Health Endpoint', false, 'No response from health endpoint');
        } else {
          // Check status code
          const isHealthy = healthResponse.status() === 200;
          
          if (isHealthy) {
            // Try to parse response as JSON
            const healthData = await page.evaluate(() => {
              try {
                return JSON.parse(document.body.innerText);
              } catch (e) {
                return null;
              }
            });
            
            logTest('Health Endpoint', isHealthy && healthData, isHealthy && healthData 
                    ? `Health endpoint returned status OK with timestamp: ${healthData.timestamp}` 
                    : 'Health endpoint returned but response is not valid JSON');
          } else {
            logTest('Health Endpoint', false, `Health endpoint returned status: ${healthResponse.status()}`);
          }
        }
      } catch (healthError) {
        logTest('Health Endpoint', false, `Error checking health endpoint: ${healthError.message}`);
      }
      
      // Test poll API endpoints
      try {
        // Try to fetch poll data for slide 2 default poll
        const pollResponse = await page.goto(`${LIVE_URL}/api/polls/slide-2-default`, { waitUntil: 'networkidle0' });
        
        if (!pollResponse) {
          logTest('Poll API', false, 'No response from poll API endpoint');
        } else {
          // Check status code
          const isPollApiWorking = pollResponse.status() === 200;
          
          if (isPollApiWorking) {
            // Try to parse response as JSON
            const pollData = await page.evaluate(() => {
              try {
                return JSON.parse(document.body.innerText);
              } catch (e) {
                return null;
              }
            });
            
            logTest('Poll API', isPollApiWorking && pollData && pollData.success, isPollApiWorking && pollData && pollData.success 
                    ? `Poll API returned results for slide-2-default poll` 
                    : 'Poll API returned but response is not valid or successful');
          } else {
            logTest('Poll API', false, `Poll API returned status: ${pollResponse.status()}`);
          }
        }
      } catch (pollError) {
        logTest('Poll API', false, `Error checking poll API: ${pollError.message}`);
      }
    } catch (error) {
      logTest('API Endpoints', false, `Error during API endpoint tests: ${error.message}`);
    }
    
    // Test 6: Take screenshots for visual inspection
    try {
      console.log('\nTest 6: Taking screenshots for visual inspection');
      
      // Navigate to first slide
      await page.goto(`${LIVE_URL}/public/01-introduction.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
      
      // Take screenshot of title slide
      await page.screenshot({ path: 'vercel-title-slide.png' });
      console.log('  Saved screenshot of title slide to vercel-title-slide.png');
      
      // Navigate to poll slide
      await page.goto(`${LIVE_URL}/public/03-revenue-acceleration.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
      
      // Take screenshot of poll slide
      await page.screenshot({ path: 'vercel-poll-slide.png' });
      console.log('  Saved screenshot of poll slide to vercel-poll-slide.png');
      
      logTest('Screenshots', true, 'Successfully captured screenshots for visual inspection');
    } catch (error) {
      logTest('Screenshots', false, `Error taking screenshots: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error running tests:', error);
  } finally {
    // Cleanup
    if (browser) await browser.close();
    
    // Print summary
    console.log('\n===============================================================');
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
    if (passedTests === totalTests) {
      console.log('✅ All Vercel deployment tests passed!');
    } else {
      console.log(`❌ ${totalTests - passedTests} tests failed.`);
    }
    console.log('===============================================================');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
