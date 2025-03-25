const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Create diagnostics directory
const diagDir = path.join(__dirname, 'diagnostics');
if (!fs.existsSync(diagDir)) {
  fs.mkdirSync(diagDir);
}

// Log function
function log(message) {
  console.log(message);
  fs.appendFileSync(path.join(diagDir, 'diagnosis.log'), `${new Date().toISOString()}: ${message}\n`);
}

// Test local server
function testLocalServer() {
  return new Promise((resolve) => {
    log('Testing local server at http://localhost:3000...');
    
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        log(`Local server responded with status code: ${res.statusCode}`);
        
        // Save response content
        fs.writeFileSync(path.join(diagDir, 'local_response.html'), data);
        
        // Check for common issues
        const iframeCheck = data.includes('<iframe');
        const styleCheck = data.includes('styles.css');
        const scriptCheck = data.includes('script src=');
        const supabaseCheck = data.includes('supabase');
        
        log(`Local response contains: ${data.length} bytes`);
        log(`Contains iframe tag: ${iframeCheck}`);
        log(`Contains styles.css reference: ${styleCheck}`);
        log(`Contains script tags: ${scriptCheck}`);
        log(`Contains supabase reference: ${supabaseCheck}`);
        
        resolve({
          success: true,
          statusCode: res.statusCode,
          containsIframe: iframeCheck,
          containsStyles: styleCheck,
          containsScripts: scriptCheck,
          containsSupabase: supabaseCheck
        });
      });
    });
    
    req.on('error', (error) => {
      log(`Error connecting to local server: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      log('Local server request timed out');
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// Test production server
function testProductionServer() {
  return new Promise((resolve) => {
    log('Testing production server at https://fullthrottle.revelateops.com...');
    
    const req = https.get('https://fullthrottle.revelateops.com', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        log(`Production server responded with status code: ${res.statusCode}`);
        
        // Save response content
        fs.writeFileSync(path.join(diagDir, 'production_response.html'), data);
        
        // Check for common issues
        const iframeCheck = data.includes('<iframe');
        const styleCheck = data.includes('styles.css');
        const scriptCheck = data.includes('script src=');
        const supabaseCheck = data.includes('supabase');
        
        log(`Production response contains: ${data.length} bytes`);
        log(`Contains iframe tag: ${iframeCheck}`);
        log(`Contains styles.css reference: ${styleCheck}`);
        log(`Contains script tags: ${scriptCheck}`);
        log(`Contains supabase reference: ${supabaseCheck}`);
        
        resolve({
          success: true,
          statusCode: res.statusCode,
          containsIframe: iframeCheck,
          containsStyles: styleCheck,
          containsScripts: scriptCheck,
          containsSupabase: supabaseCheck
        });
      });
    });
    
    req.on('error', (error) => {
      log(`Error connecting to production server: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      log('Production server request timed out');
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// Check file paths
function checkFilePaths() {
  log('Checking essential file paths...');
  
  const criticalFiles = [
    { path: 'index.html', name: 'Main Index' },
    { path: 'styles.css', name: 'Main Stylesheet' },
    { path: 'public/01-introduction.html', name: 'Intro Slide' },
    { path: 'server.js', name: 'Server Script' },
    { path: 'db/supabase/database.js', name: 'Supabase DB' },
    { path: 'images/logo.png', name: 'Logo Image' },
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file.path))) {
      log(`✅ ${file.name} (${file.path}) exists`);
    } else {
      log(`❌ ${file.name} (${file.path}) MISSING`);
    }
  });
  
  // Check public slides
  const slidesDir = path.join(__dirname, 'public');
  if (fs.existsSync(slidesDir)) {
    const slides = fs.readdirSync(slidesDir).filter(file => file.endsWith('.html'));
    log(`Found ${slides.length} slides in the public directory`);
    slides.forEach(slide => {
      log(`  - ${slide}`);
    });
  } else {
    log('❌ Public slides directory MISSING');
  }
}

// Main function
async function runDiagnostics() {
  log('Starting Full Throttle presentation diagnostics...');
  log(`Current directory: ${__dirname}`);
  log('----------------------------------------------------');
  
  // Check file paths
  checkFilePaths();
  log('----------------------------------------------------');
  
  // Test local server
  const localResult = await testLocalServer();
  log('----------------------------------------------------');
  
  // Test production server
  const productionResult = await testProductionServer();
  log('----------------------------------------------------');
  
  // Analyze results
  log('Diagnostic Summary:');
  if (!localResult.success) {
    log('❌ Local server is not responding. Check if the server is running.');
  } else if (localResult.statusCode !== 200) {
    log(`⚠️ Local server responded with non-200 status code: ${localResult.statusCode}`);
  } else {
    log('✅ Local server is responding properly');
  }
  
  if (!productionResult.success) {
    log('❌ Production server is not responding. Vercel deployment may not be complete.');
  } else if (productionResult.statusCode !== 200) {
    log(`⚠️ Production server responded with non-200 status code: ${productionResult.statusCode}`);
  } else {
    log('✅ Production server is responding properly');
  }
  
  // Check for iframe issues
  if (localResult.success && !localResult.containsIframe) {
    log('⚠️ The iframe tag appears to be missing in the local server response');
  }
  
  if (productionResult.success && !productionResult.containsIframe) {
    log('⚠️ The iframe tag appears to be missing in the production server response');
  }
  
  // Check for CSS issues
  if (localResult.success && !localResult.containsStyles) {
    log('⚠️ The styles.css reference appears to be missing in the local server response');
  }
  
  if (productionResult.success && !productionResult.containsStyles) {
    log('⚠️ The styles.css reference appears to be missing in the production server response');
  }
  
  // Check for Supabase issues
  if (localResult.success && !localResult.containsSupabase) {
    log('⚠️ The Supabase reference appears to be missing in the local server response');
  }
  
  log('----------------------------------------------------');
  log('Diagnostics complete. Results saved to the diagnostics directory.');
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`Diagnostic error: ${error.message}`);
});
