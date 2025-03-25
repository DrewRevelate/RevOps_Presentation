const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create directory for diagnostics if it doesn't exist
const diagDir = path.join(__dirname, 'diagnostics');
if (!fs.existsSync(diagDir)) {
  fs.mkdirSync(diagDir);
}

async function diagnose() {
  console.log('Starting diagnostic on Full Throttle presentation...');
  
  const browser = await puppeteer.launch({
    headless: false,  // Set to true for headless operation
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 },
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    ignoreDefaultArgs: ['--disable-extensions'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Collect console logs, network requests, and errors
    page.on('console', message => {
      console.log(`Console ${message.type()}: ${message.text()}`);
      
      // Write console errors to file
      if (message.type() === 'error') {
        fs.appendFileSync(
          path.join(diagDir, 'console_errors.log'), 
          `${new Date().toISOString()}: ${message.text()}\n`
        );
      }
    });
    
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
      fs.appendFileSync(
        path.join(diagDir, 'page_errors.log'), 
        `${new Date().toISOString()}: ${error.message}\n`
      );
    });
    
    page.on('requestfailed', request => {
      console.error(`Request failed: ${request.url()}`);
      console.error(`Reason: ${request.failure().errorText}`);
      fs.appendFileSync(
        path.join(diagDir, 'request_failures.log'), 
        `${new Date().toISOString()}: ${request.url()} - ${request.failure().errorText}\n`
      );
    });
    
    // Set a timeout to catch navigation issues
    let pageLoaded = false;
    const timeout = setTimeout(() => {
      if (!pageLoaded) {
        console.log('Page load timed out - capturing current state');
        captureState(page, 'timeout');
      }
    }, 15000);
    
    // Navigate to the site (local development first)
    console.log('Navigating to local development server...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    }).catch(async (e) => {
      console.error(`Navigation error: ${e.message}`);
      await captureState(page, 'local_error');
      
      // If local fails, try the production URL
      console.log('Trying production URL...');
      await page.goto('https://fullthrottle.revelateops.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      }).catch(async (e) => {
        console.error(`Production navigation error: ${e.message}`);
        await captureState(page, 'prod_error');
      });
    });
    
    pageLoaded = true;
    clearTimeout(timeout);
    
    // Take fullpage screenshot
    await captureState(page, 'final');
    
    // Evaluate iframe issues
    const iframeCheck = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length === 0) {
        return { found: false, message: 'No iframes found on page' };
      }
      
      return {
        found: true,
        count: iframes.length,
        details: Array.from(iframes).map(iframe => ({
          id: iframe.id,
          src: iframe.src,
          sandbox: iframe.sandbox ? iframe.sandbox.value : 'none',
          width: iframe.width,
          height: iframe.height,
          style: iframe.getAttribute('style')
        }))
      };
    });
    
    console.log('Iframe check results:', iframeCheck);
    fs.writeFileSync(
      path.join(diagDir, 'iframe_check.json'),
      JSON.stringify(iframeCheck, null, 2)
    );
    
    // Check HTML for common iframe security issues
    const htmlContent = await page.content();
    fs.writeFileSync(path.join(diagDir, 'page_content.html'), htmlContent);
    
    // Run various tests to diagnose issues
    await runDiagnosticTests(page);
    
  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    await browser.close();
    console.log('Diagnostic complete. Check the "diagnostics" folder for results.');
  }
}

async function captureState(page, label) {
  // Take screenshot
  await page.screenshot({ 
    path: path.join(diagDir, `${label}_screenshot.png`),
    fullPage: true 
  });
  
  // Save HTML content
  const html = await page.content();
  fs.writeFileSync(path.join(diagDir, `${label}_content.html`), html);
  
  // Get console state
  const consoleErrors = await page.evaluate(() => {
    if (window.errors && window.errors.length) {
      return window.errors;
    }
    return [];
  });
  
  if (consoleErrors.length) {
    fs.writeFileSync(
      path.join(diagDir, `${label}_console_errors.json`),
      JSON.stringify(consoleErrors, null, 2)
    );
  }
}

async function runDiagnosticTests(page) {
  console.log('Running specialized diagnostic tests...');
  
  // Check for JavaScript errors
  const jsErrors = await page.evaluate(() => {
    if (window.jsErrors && window.jsErrors.length) {
      return window.jsErrors;
    }
    return [];
  });
  
  if (jsErrors.length) {
    console.log('JavaScript errors found:', jsErrors);
    fs.writeFileSync(
      path.join(diagDir, 'js_errors.json'),
      JSON.stringify(jsErrors, null, 2)
    );
  }
  
  // Check if supabase is correctly initialized
  const supabaseTest = await page.evaluate(() => {
    try {
      // Check for direct global
      if (typeof supabase !== 'undefined' && supabase) {
        return { 
          exists: true,
          type: typeof supabase
        };
      }
      
      // Check for window property
      if (typeof window.supabase !== 'undefined' && window.supabase) {
        return { 
          exists: true,
          type: typeof window.supabase,
          fromWindow: true
        };
      }
      
      // Check for script inclusion
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
      const hasSupabaseScript = scripts.some(src => src.includes('supabase'));
      
      return { 
        exists: false,
        hasSupabaseScript,
        scripts
      };
    } catch (e) {
      return { 
        exists: false, 
        error: e.message 
      };
    }
  });
  
  console.log('Supabase test result:', supabaseTest);
  fs.writeFileSync(
    path.join(diagDir, 'supabase_test.json'),
    JSON.stringify(supabaseTest, null, 2)
  );
  
  // Check CSS loading
  const cssTest = await page.evaluate(() => {
    const styleSheets = Array.from(document.styleSheets);
    try {
      return {
        count: styleSheets.length,
        urls: styleSheets.map(sheet => sheet.href).filter(Boolean),
        inlineStyles: document.querySelectorAll('style').length
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('CSS test result:', cssTest);
  fs.writeFileSync(
    path.join(diagDir, 'css_test.json'),
    JSON.stringify(cssTest, null, 2)
  );
  
  // Check if slides are accessible
  try {
    console.log('Testing slide navigation...');
    
    // Try to find any buttons that might lead to the first slide
    const buttons = await page.$$('button');
    if (buttons.length) {
      console.log(`Found ${buttons.length} buttons on the page`);
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        console.log(`Button text: ${text}`);
        
        if (text.includes('Start') || text.includes('Begin') || text.includes('Next')) {
          console.log(`Clicking "${text}" button...`);
          await button.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ 
            path: path.join(diagDir, 'after_button_click.png'),
            fullPage: true 
          });
        }
      }
    }
  } catch (e) {
    console.error('Error testing navigation:', e);
  }
}

// Run the diagnostic
diagnose().catch(console.error);
