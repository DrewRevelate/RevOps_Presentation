// Comprehensive test suite for Full Throttle Revenue presentation
// Uses Puppeteer for browser automation

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update to your local development URL
const PRESENTATION_TIMEOUT = 60000; // 60 seconds timeout for loading pages
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize test results object
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  details: []
};

// Test helpers
function logSuccess(testName, message) {
  console.log(`✅ ${testName}: ${message}`);
  testResults.passedTests++;
  testResults.totalTests++;
  testResults.details.push({ test: testName, status: 'passed', message });
}

function logFailure(testName, message, error = null) {
  console.error(`❌ ${testName}: ${message}`);
  if (error) console.error(error);
  testResults.failedTests++;
  testResults.totalTests++;
  testResults.details.push({ test: testName, status: 'failed', message, error: error?.toString() });
}

function logSkipped(testName, reason) {
  console.warn(`⚠️ ${testName}: Skipped - ${reason}`);
  testResults.skippedTests++;
  testResults.totalTests++;
  testResults.details.push({ test: testName, status: 'skipped', message: reason });
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Full Throttle presentation tests');
  console.log('----------------------------------------');
  
  let browser;
  let supabase;
  
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
    
    // Initialize Supabase client
    if (SUPABASE_URL && SUPABASE_KEY) {
      console.log('Initializing Supabase client...');
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
      console.warn('Supabase credentials not found in environment variables');
    }
    
    // Run all tests
    await testBasicNavigation(browser);
    await testSupabaseConnection(supabase);
    await testPollFunctionality(browser, supabase);
    await testResponsiveDesign(browser);
    
    // Print summary
    console.log('----------------------------------------');
    console.log(`📊 Test Summary: ${testResults.passedTests}/${testResults.totalTests} passed, ${testResults.failedTests} failed, ${testResults.skippedTests} skipped`);
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
    console.log('📝 Test results saved to test-results.json');
    
  } catch (error) {
    console.error('❌ Fatal error running tests:', error);
  } finally {
    // Cleanup
    if (browser) await browser.close();
  }
}

// Test 1: Basic Navigation
async function testBasicNavigation(browser) {
  console.log('\n📋 Running Basic Navigation Tests');
  
  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(PRESENTATION_TIMEOUT);
    
    // Test 1.1: Can load index page
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      const title = await page.title();
      
      if (title.includes('Full Throttle Revenue')) {
        logSuccess('Load Index', 'Successfully loaded index page with correct title');
      } else {
        logFailure('Load Index', `Title does not match: ${title}`);
      }
    } catch (error) {
      logFailure('Load Index', 'Failed to load index page', error);
    }
    
    // Test 1.2: Can navigate to first slide
    try {
      await page.waitForSelector('#presentationContainer iframe, #loadingScreen');
      await page.waitForTimeout(3000); // Wait for possible redirect or loading
      
      // Check if we're on slide 1 either directly or in iframe
      const currentUrl = page.url();
      const isSlide1 = currentUrl.includes('01-introduction.html') || 
                       await page.evaluate(() => {
                         const iframe = document.querySelector('#presentationContainer iframe');
                         return iframe && iframe.src.includes('01-introduction.html');
                       });
      
      if (isSlide1) {
        logSuccess('Navigate to Slide 1', 'Successfully navigated to first slide');
      } else {
        // Try clicking through if not redirected automatically
        try {
          const startButton = await page.$('a.start-button, a.nav-button.next');
          if (startButton) {
            await startButton.click();
            await page.waitForTimeout(2000);
            
            // Check again after click
            const newUrl = page.url();
            if (newUrl.includes('01-introduction.html')) {
              logSuccess('Navigate to Slide 1', 'Successfully navigated to first slide via button click');
            } else {
              logFailure('Navigate to Slide 1', `Failed to navigate to first slide, current URL: ${newUrl}`);
            }
          } else {
            logFailure('Navigate to Slide 1', 'No navigation button found and not automatically redirected');
          }
        } catch (clickError) {
          logFailure('Navigate to Slide 1', 'Error clicking navigation button', clickError);
        }
      }
    } catch (error) {
      logFailure('Navigate to Slide 1', 'Failed while waiting for presentation container', error);
    }
    
    // Test 1.3: Can navigate through slides using arrow buttons
    try {
      // Get the total number of slides
      const slideCount = await page.evaluate(() => {
        const indicator = document.querySelector('.slide-indicator');
        if (!indicator) return 8; // Default if not found
        const match = indicator.textContent.match(/(\d+)\/(\d+)/);
        return match ? parseInt(match[2]) : 8;
      });
      
      console.log(`Detected ${slideCount} total slides`);
      
      // Navigate through slides using next button
      let navigationSuccessful = true;
      for (let i = 1; i < slideCount; i++) {
        try {
          // Click next button
          await page.click('.nav-button.next');
          await page.waitForTimeout(1000);
          
          // Verify slide number updated
          const currentSlideNum = await page.evaluate(() => {
            const indicator = document.querySelector('.slide-indicator');
            if (!indicator) return null;
            const match = indicator.textContent.match(/(\d+)\/(\d+)/);
            return match ? parseInt(match[1]) : null;
          });
          
          if (currentSlideNum !== i + 1) {
            logFailure(`Navigate to Slide ${i + 1}`, `Expected slide ${i + 1}, got ${currentSlideNum}`);
            navigationSuccessful = false;
            break;
          }
        } catch (navError) {
          logFailure(`Navigate to Slide ${i + 1}`, 'Navigation failed', navError);
          navigationSuccessful = false;
          break;
        }
      }
      
      if (navigationSuccessful) {
        logSuccess('Navigate Through Slides', `Successfully navigated through all ${slideCount} slides`);
      }
      
      // Navigate back to slide 3 for poll testing
      await page.goto(`${BASE_URL}/public/03-revenue-acceleration.html`, { waitUntil: 'networkidle0' });
      
    } catch (error) {
      logFailure('Navigate Through Slides', 'Failed during slide navigation', error);
    }
    
    await page.close();
    
  } catch (error) {
    logFailure('Basic Navigation', 'Unexpected error in navigation tests', error);
  }
}

// Test 2: Supabase Connection
async function testSupabaseConnection(supabase) {
  console.log('\n📋 Running Supabase Connection Tests');
  
  if (!supabase) {
    logSkipped('Supabase Connection', 'Supabase client not initialized');
    return;
  }
  
  // Test 2.1: Connect to Supabase
  try {
    // Test authentication service
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logFailure('Supabase Auth', 'Failed to connect to Supabase auth service', error);
    } else {
      logSuccess('Supabase Auth', 'Successfully connected to Supabase auth service');
    }
  } catch (error) {
    logFailure('Supabase Auth', 'Unexpected error connecting to Supabase auth', error);
  }
  
  // Test 2.2: Verify poll_definitions table exists
  try {
    const { data, error } = await supabase.from('poll_definitions').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST205') {
        logFailure('Poll Definitions Table', 'Table does not exist - run setup script');
      } else {
        logFailure('Poll Definitions Table', 'Error accessing table', error);
      }
    } else {
      logSuccess('Poll Definitions Table', 'Successfully verified poll_definitions table exists');
    }
  } catch (error) {
    logFailure('Poll Definitions Table', 'Unexpected error querying poll_definitions', error);
  }
  
  // Test 2.3: Verify predefined polls exist
  try {
    const { data: polls, error } = await supabase
      .from('poll_definitions')
      .select('poll_id')
      .in('poll_id', ['slide-2-default', 'slide-5-student-skills']);
    
    if (error) {
      logFailure('Predefined Polls', 'Error fetching predefined polls', error);
    } else if (!polls || polls.length === 0) {
      logFailure('Predefined Polls', 'No predefined polls found - run seed script');
    } else if (polls.length < 2) {
      logFailure('Predefined Polls', `Only ${polls.length}/2 predefined polls found - run seed script`);
    } else {
      logSuccess('Predefined Polls', 'Successfully verified predefined polls exist');
    }
  } catch (error) {
    logFailure('Predefined Polls', 'Unexpected error querying predefined polls', error);
  }
}

// Test 3: Poll Functionality
async function testPollFunctionality(browser, supabase) {
  console.log('\n📋 Running Poll Functionality Tests');
  
  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(PRESENTATION_TIMEOUT);
    
    // Navigate to slide with poll (slide 3)
    await page.goto(`${BASE_URL}/public/03-revenue-acceleration.html`, { waitUntil: 'networkidle0' });
    
    // Test 3.1: Poll container exists and is visible
    try {
      const pollContainer = await page.$('.poll-container');
      
      if (pollContainer) {
        const isVisible = await page.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }, pollContainer);
        
        if (isVisible) {
          logSuccess('Poll Container', 'Poll container exists and is visible');
        } else {
          logFailure('Poll Container', 'Poll container exists but is not visible');
        }
      } else {
        logFailure('Poll Container', 'Poll container not found on slide 3');
      }
    } catch (error) {
      logFailure('Poll Container', 'Error checking poll container', error);
    }
    
    // Test 3.2: Can select poll option
    try {
      // Find all poll options
      const pollOptions = await page.$$('.poll-option');
      
      if (pollOptions.length === 0) {
        logFailure('Poll Options', 'No poll options found');
      } else {
        // Click the first option
        await pollOptions[0].click();
        await page.waitForTimeout(500);
        
        // Verify option is selected
        const isSelected = await page.evaluate(() => {
          const selected = document.querySelector('.poll-option.selected');
          return !!selected;
        });
        
        if (isSelected) {
          logSuccess('Poll Option Selection', 'Successfully selected a poll option');
        } else {
          logFailure('Poll Option Selection', 'Failed to select poll option');
        }
      }
    } catch (error) {
      logFailure('Poll Option Selection', 'Error selecting poll option', error);
    }
    
    // Test 3.3: Can submit poll (if not already submitted)
    try {
      // Check if poll is already submitted
      const alreadySubmitted = await page.evaluate(() => {
        return document.querySelector('.poll-container').classList.contains('voted');
      });
      
      if (alreadySubmitted) {
        logSkipped('Poll Submission', 'Poll already submitted');
      } else {
        // Click submit button
        const submitBtn = await page.$('.poll-submit');
        
        if (!submitBtn) {
          logFailure('Poll Submission', 'Submit button not found');
        } else {
          await submitBtn.click();
          await page.waitForTimeout(2000);
          
          // Verify results are shown
          const resultsShown = await page.evaluate(() => {
            return document.querySelector('.poll-results.show') !== null;
          });
          
          if (resultsShown) {
            logSuccess('Poll Submission', 'Successfully submitted poll and results are shown');
          } else {
            logFailure('Poll Submission', 'Results not shown after submission');
          }
        }
      }
    } catch (error) {
      logFailure('Poll Submission', 'Error submitting poll', error);
    }
    
    // Test 3.4: Results display has data
    try {
      const hasResults = await page.evaluate(() => {
        const percentages = Array.from(document.querySelectorAll('.poll-result-percentage'))
          .map(el => parseFloat(el.textContent));
        return percentages.some(p => p > 0);
      });
      
      if (hasResults) {
        logSuccess('Poll Results', 'Poll results are displayed with data');
      } else {
        logFailure('Poll Results', 'Poll results are shown but have no data');
      }
    } catch (error) {
      logFailure('Poll Results', 'Error checking poll results', error);
    }
    
    await page.close();
    
  } catch (error) {
    logFailure('Poll Functionality', 'Unexpected error in poll functionality tests', error);
  }
}

// Test 4: Responsive Design
async function testResponsiveDesign(browser) {
  console.log('\n📋 Running Responsive Design Tests');
  
  const viewports = [
    { name: 'Desktop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];
  
  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(PRESENTATION_TIMEOUT);
    
    // Navigate to first slide
    await page.goto(`${BASE_URL}/public/01-introduction.html`, { waitUntil: 'networkidle0' });
    
    // Test responsive design across different viewport sizes
    for (const viewport of viewports) {
      try {
        // Set viewport
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        // Take screenshot
        const filename = `screenshot-${viewport.name.toLowerCase()}.png`;
        await page.screenshot({ path: filename });
        
        // Check for mobile class on smaller viewports
        const hasMobileClass = await page.evaluate(() => {
          return document.body.classList.contains('mobile-device');
        });
        
        const shouldHaveMobileClass = viewport.width <= 768;
        
        if (shouldHaveMobileClass === hasMobileClass) {
          logSuccess(`${viewport.name} Viewport`, `Successfully rendered at ${viewport.width}x${viewport.height} with correct mobile class`);
        } else {
          logFailure(`${viewport.name} Viewport`, `Mobile class detection incorrect. Expected ${shouldHaveMobileClass}, got ${hasMobileClass}`);
        }
        
        // Check if content is visible
        const contentVisible = await page.evaluate(() => {
          const title = document.querySelector('.main-title');
          if (!title) return false;
          
          const titleRect = title.getBoundingClientRect();
          return titleRect.width > 0 && titleRect.height > 0;
        });
        
        if (contentVisible) {
          logSuccess(`${viewport.name} Content`, 'Title content is visible');
        } else {
          logFailure(`${viewport.name} Content`, 'Title content is not visible');
        }
        
      } catch (error) {
        logFailure(`${viewport.name} Viewport`, `Error testing ${viewport.width}x${viewport.height} viewport`, error);
      }
    }
    
    await page.close();
    
  } catch (error) {
    logFailure('Responsive Design', 'Unexpected error in responsive design tests', error);
  }
}

// Run all tests
runTests().catch(console.error);
