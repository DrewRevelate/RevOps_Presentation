// Configuration for FullThrottle presentation tests
require('dotenv').config();

module.exports = {
  // Local server configuration
  local: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.TIMEOUT || '60000', 10),
  },
  
  // Vercel deployment configuration 
  vercel: {
    baseUrl: process.env.VERCEL_URL || 'https://fullthrottle.revelateops.com',
    timeout: parseInt(process.env.TIMEOUT || '60000', 10),
  },
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    projectId: 'zdnmzumoccwagafxtnld',
  },
  
  // Puppeteer configuration
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    slowMo: parseInt(process.env.PUPPETEER_SLOWMO || '0', 10),
    viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1366', 10),
    viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '768', 10),
  },
  
  // Poll configuration
  polls: {
    testPollIds: ['slide-2-default', 'slide-5-student-skills'],
    testUserId: `test-user-${Date.now()}`,
  }
};
