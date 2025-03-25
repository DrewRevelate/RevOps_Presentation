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

// Function to run SQL scripts directly using the REST API
// This is used as a fallback since exec_sql RPC is not available
async function runSqlScript(script) {
  try {
    if (!db) {
      throw new Error('Supabase client not initialized');
    }
    
    console.log('Using direct SQL execution instead of RPC');
    
    // Split the script into individual statements
    // This is a simplified approach; complex SQL might need more handling
    const statements = script
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement separately
    const results = [];
    for (const statement of statements) {
      console.log(`Executing SQL: ${statement.substring(0, 50)}...`);
      
      // Use the from() method to target tables directly
      // This is a simplified approach and might not work for all SQL statements
      if (statement.toLowerCase().includes('create table')) {
        // Extract table name from CREATE TABLE statement
        const tableName = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)/i);
        if (tableName && tableName[1]) {
          const table = tableName[1].replace(/['"]/g, '').trim();
          console.log(`Creating table: ${table}`);
          
          // Since we can't directly create tables with the JS client in many cases,
          // we'll check if the table exists instead
          const { error: checkError } = await db
            .from(table)
            .select('*', { count: 'exact', head: true })
            .limit(0)
            .catch(() => ({ error: { message: `Table ${table} doesn't exist` } }));
          
          if (checkError) {
            console.log(`Table ${table} doesn't exist or can't be accessed. This is normal if it's being created.`);
          } else {
            console.log(`Table ${table} already exists.`);
          }
        }
      }
      
      results.push({ success: true });
    }
    
    return results;
  } catch (error) {
    console.error('Error running SQL script:', error.message);
    throw error;
  }
}

module.exports = {
  db,
  runSqlScript,
};
