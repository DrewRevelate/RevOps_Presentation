// Supabase database module for Full Throttle presentation
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Extract Supabase configuration from environment variables
// Use fallback values from the project requirements if env vars are not set
const supabaseUrl = process.env.SUPABASE_URL || 'https://zdnmzumoccwagafxtnld.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbm16dW1vY2N3YWdhZnh0bmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NDYyNTEsImV4cCI6MjA1ODAyMjI1MX0.kHCrQ0HG08Myk4JFzxgIyAvbeAcHtrc8YwE08rhHxQ8';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');

// Initialize Supabase client
const db = createClient(supabaseUrl, supabaseKey);

// Function to run SQL scripts
async function runSqlScript(script) {
  try {
    if (!db) {
      throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await db.rpc('exec_sql', { sql: script });
    
    if (error) {
      throw new Error(`SQL script execution failed: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error running SQL script:', error.message);
    throw error;
  }
}

module.exports = {
  db,
  runSqlScript,
};
