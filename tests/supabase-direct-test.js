// Direct Supabase test script that bypasses RLS and tests the API route
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const config = require('./config');

// Use environment variables from config
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.key;
const baseUrl = config.local.baseUrl;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseAPI() {
  console.log('🚀 Running Supabase API Tests');
  console.log('=============================');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  console.log(`Using Local API URL: ${baseUrl}`);
  
  // Test 1: Basic Auth Connection
  try {
    console.log('\nTest 1: Testing Supabase authentication connection');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase authentication');
    }
  } catch (err) {
    console.error('❌ Unexpected error testing authentication:', err.message);
  }
  
  // Test 2: Test API Route for Poll Definitions
  try {
    console.log('\nTest 2: Testing API route for poll definitions');
    
    // First check if server is running
    try {
      await fetch(`${baseUrl}/health`);
      console.log('✅ Local server is running and responding');
    } catch (err) {
      console.error('❌ Local server is not running. Start with npm run dev first.');
      console.log('Would you like to continue testing the Supabase connection directly? (y/n)');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('', ans => {
          readline.close();
          resolve(ans.toLowerCase());
        });
      });
      
      if (answer !== 'y') {
        console.log('Test aborted. Please start the local server and try again.');
        return;
      }
    }
    
    // Test accessing poll data via API
    try {
      const pollId = 'slide-2-default';
      const response = await fetch(`${baseUrl}/api/polls/${pollId}`);
      
      if (!response.ok) {
        console.error(`❌ API route returned status: ${response.status}`);
      } else {
        const data = await response.json();
        console.log('✅ Successfully retrieved poll data via API');
        console.log(`   Poll: ${pollId}`);
        if (data.poll) {
          console.log(`   Title: ${data.poll.title}`);
          console.log(`   Active: ${data.poll.isActive ? 'Yes' : 'No'}`);
        }
        if (data.results) {
          console.log(`   Results format valid: ${typeof data.results === 'object' ? 'Yes' : 'No'}`);
        }
      }
    } catch (err) {
      console.error('❌ Error testing API route:', err.message);
    }
    
    // Test submitting poll response
    try {
      console.log('\nTest 3: Testing poll submission API');
      
      const pollId = 'slide-2-default';
      const testUserId = `test-api-${Date.now()}`;
      const testVote = 'prospecting';
      
      const response = await fetch(`${baseUrl}/api/polls/${pollId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          votes: [testVote],
          userId: testUserId,
          slideId: 'test-slide',
          userAgent: 'Supabase Test Script',
          screen: '1920x1080'
        })
      });
      
      if (!response.ok) {
        console.error(`❌ Poll submission API returned status: ${response.status}`);
      } else {
        const data = await response.json();
        console.log('✅ Successfully submitted test poll vote via API');
        if (data.results) {
          console.log(`   Results received: ${Object.keys(data.results).length} options`);
          console.log(`   Vote registered for "${testVote}": ${data.results[testVote] > 0 ? 'Yes' : 'No'}`);
        }
      }
    } catch (err) {
      console.error('❌ Error testing poll submission API:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error testing API routes:', err.message);
  }
  
  // Test 4: Direct Database Queries via Supabase JS Client
  try {
    console.log('\nTest 4: Direct database access with Supabase client');
    console.log('⚠️ These may fail due to Row Level Security (RLS) policies');
    
    // Test poll_definitions access
    try {
      const { data, error } = await supabase
        .from('poll_definitions')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Cannot directly access poll_definitions:', error.message);
        console.log('   This is expected if RLS is enabled and you are using anon key');
      } else {
        console.log('✅ Successfully accessed poll_definitions table');
        console.log(`   Retrieved ${data.length} records`);
      }
    } catch (err) {
      console.error('❌ Error accessing poll_definitions:', err.message);
    }
    
    // Test poll data via RPC
    try {
      console.log('\nTest 5: Testing database function calls');
      
      const { data, error } = await supabase.rpc('get_poll_data', {
        poll_id_param: 'slide-2-default'
      });
      
      if (error) {
        console.log('❌ RPC call failed:', error.message);
      } else {
        console.log('✅ Successfully called RPC function');
        console.log(`   Retrieved data: ${data ? 'Yes' : 'No'}`);
      }
    } catch (err) {
      console.error('❌ Error calling RPC function:', err.message);
    }
  } catch (err) {
    console.error('❌ Unexpected error in direct database tests:', err.message);
  }
  
  console.log('\n✨ Test completed');
}

// Run the tests
testSupabaseAPI().catch(console.error);
