// Puppeteer diagnostic script to help troubleshoot Chrome detection issues
const puppeteer = require('puppeteer');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function runDiagnostics() {
  console.log('🔍 Running Puppeteer/Chrome diagnostics...');
  console.log('----------------------------------------');
  
  // System information
  console.log('📊 System Information:');
  console.log(`OS: ${os.type()} ${os.release()} (${os.platform()})`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Puppeteer: ${require('puppeteer/package.json').version}`);
  console.log('----------------------------------------');
  
  // Check for Chrome installation
  console.log('🔍 Checking for Chrome installations:');
  
  let chromeExecutablePath = null;
  
  // Common Chrome paths by platform
  const chromePaths = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      path.join(os.homedir(), '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium'
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ]
  };
  
  // Check the common paths
  const pathsToCheck = chromePaths[os.platform()] || [];
  for (const chromePath of pathsToCheck) {
    try {
      if (fs.existsSync(chromePath)) {
        console.log(`✅ Found Chrome at: ${chromePath}`);
        chromeExecutablePath = chromePath;
        
        // Try to get version
        try {
          let command;
          if (os.platform() === 'win32') {
            command = `"${chromePath}" --version`;
          } else {
            command = `"${chromePath}" --version`;
          }
          
          const version = execSync(command).toString().trim();
          console.log(`   Version: ${version}`);
        } catch (err) {
          console.log('   Could not determine version');
        }
      }
    } catch (err) {
      // Ignore errors when checking paths
    }
  }
  
  if (!chromeExecutablePath) {
    console.log('❌ No Chrome installation found in standard locations');
    console.log('   If Chrome is installed in a non-standard location, set PUPPETEER_EXECUTABLE_PATH');
  }
  
  console.log('----------------------------------------');
  
  // Check if Puppeteer can find Chrome
  try {
    console.log('🔍 Testing Puppeteer browser launch:');
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: 30000
    })
    .catch(err => {
      console.error('❌ Failed to launch browser:', err.message);
      return null;
    });
    
    if (browser) {
      console.log('✅ Puppeteer successfully launched browser');
      
      const browserVersion = await browser.version();
      console.log(`   Browser version: ${browserVersion}`);
      
      // Check if we can create a page
      try {
        const page = await browser.newPage();
        console.log('✅ Successfully created new page');
        await page.close();
      } catch (pageError) {
        console.error('❌ Failed to create new page:', pageError.message);
      }
      
      await browser.close();
      console.log('✅ Browser closed successfully');
    }
  } catch (err) {
    console.error('❌ Unexpected error during browser launch test:', err);
  }
  
  console.log('----------------------------------------');
  console.log('🛠️ Troubleshooting tips:');
  console.log('1. If browser launch fails, try:');
  console.log('   - PUPPETEER_EXECUTABLE_PATH=/path/to/chrome node check-puppeteer.js');
  console.log('2. On macOS, run this command if permission issues occur:');
  console.log('   - xattr -d com.apple.quarantine node_modules/puppeteer/.local-chromium/*/chrome-mac/Chromium.app');
  console.log('3. Try installing latest Puppeteer:');
  console.log('   - npm install puppeteer@latest');
  console.log('4. Try downgrading Node.js to v16 or v18 if using v20+');
  console.log('----------------------------------------');
}

runDiagnostics().catch(console.error);
