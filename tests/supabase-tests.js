// Supabase-specific integration tests for Full Throttle Revenue presentation
// Tests database connection, table setup, and poll functionality

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Missing Supabase credentials!');
  console.error('Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  console.log('🚀 Running Supabase integration tests for Full Throttle presentation');
  console.log('=================================================================');
  console.log(`Using Supabase URL: ${SUPABASE_URL}`);
  console.log(`Using Supabase Key: ${SUPABASE_KEY.substring(0, 10)}...`);
  console.log('=================================================================\n');
  
  // Test 1: Supabase Connection
  try {
    console.log('Test 1: Checking Supabase Connection');
    const { data, error } = await supabase.auth.getSession();
    logTest('Connection Test', !error, error ? `Failed: ${error.message}` : 'Connected to Supabase successfully');
  } catch (error) {
    logTest('Connection Test', false, `Exception: ${error.message}`);
  }
  
  // Test 2: Required Tables Exist
  const requiredTables = [
    'poll_definitions',
    'poll_options',
    'poll_responses',
    'poll_response_options',
    'contact_submissions',
    'contact_tags',
    'contact_tag_mapping',
    'contact_interactions'
  ];
  
  try {
    console.log('\nTest 2: Checking Required Tables');
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
        
        if (error && error.code === 'PGRST205') {
          logTest(`Table: ${table}`, false, 'Table does not exist');
        } else if (error) {
          logTest(`Table: ${table}`, false, `Error accessing table: ${error.message}`);
        } else {
          logTest(`Table: ${table}`, true, 'Table exists');
        }
      } catch (tableError) {
        logTest(`Table: ${table}`, false, `Exception: ${tableError.message}`);
      }
    }
  } catch (error) {
    console.error(`Error checking tables: ${error.message}`);
  }
  
  // Test 3: Verify Poll Definitions
  try {
    console.log('\nTest 3: Checking Poll Definitions');
    
    const { data: polls, error } = await supabase
      .from('poll_definitions')
      .select('poll_id, title, description, is_active');
    
    if (error) {
      logTest('Poll Definitions', false, `Error fetching poll definitions: ${error.message}`);
    } else if (!polls || polls.length === 0) {
      logTest('Poll Definitions', false, 'No poll definitions found - run seed script');
    } else {
      // Log all polls
      polls.forEach(poll => {
        console.log(`  - Poll "${poll.poll_id}": ${poll.title} (Active: ${poll.is_active ? 'Yes' : 'No'})`);
      });
      
      // Check for required polls
      const requiredPolls = ['slide-2-default', 'slide-5-student-skills'];
      const foundPolls = polls.filter(p => requiredPolls.includes(p.poll_id));
      
      logTest('Poll Definitions', foundPolls.length === requiredPolls.length, 
              `Found ${foundPolls.length}/${requiredPolls.length} required polls`);
    }
  } catch (error) {
    logTest('Poll Definitions', false, `Exception: ${error.message}`);
  }
  
  // Test 4: Check Poll Options
  try {
    console.log('\nTest 4: Checking Poll Options');
    
    // Get poll IDs first
    const { data: polls, error: pollError } = await supabase
      .from('poll_definitions')
      .select('id, poll_id');
      
    if (pollError || !polls || polls.length === 0) {
      logTest('Poll Options', false, 'Could not fetch poll definitions');
    } else {
      // Check each poll for options
      for (const poll of polls) {
        const { data: options, error } = await supabase
          .from('poll_options')
          .select('option_id, option_text')
          .eq('poll_definition_id', poll.id);
          
        if (error) {
          logTest(`Options for ${poll.poll_id}`, false, `Error: ${error.message}`);
        } else if (!options || options.length === 0) {
          logTest(`Options for ${poll.poll_id}`, false, 'No options found');
        } else {
          logTest(`Options for ${poll.poll_id}`, true, `Found ${options.length} options`);
          
          // Log options
          console.log(`  - Poll "${poll.poll_id}" options:`);
          options.forEach(option => {
            console.log(`    * ${option.option_id}: ${option.option_text}`);
          });
        }
      }
    }
  } catch (error) {
    logTest('Poll Options', false, `Exception: ${error.message}`);
  }
  
  // Test 5: Test Poll Response Submission
  try {
    console.log('\nTest 5: Testing Poll Response Submission');
    
    // Generate a unique test user ID
    const testUserId = `test-user-${Date.now()}`;
    
    // Get the first poll
    const { data: polls, error: pollError } = await supabase
      .from('poll_definitions')
      .select('id, poll_id')
      .limit(1);
      
    if (pollError || !polls || polls.length === 0) {
      logTest('Poll Response', false, 'Could not fetch any polls');
    } else {
      const poll = polls[0];
      
      // Get an option for this poll
      const { data: options, error: optionError } = await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_definition_id', poll.id)
        .limit(1);
        
      if (optionError || !options || options.length === 0) {
        logTest('Poll Response', false, `Could not fetch options for poll ${poll.poll_id}`);
      } else {
        const option = options[0];
        
        // Submit a test response
        const { data: response, error: responseError } = await supabase
          .from('poll_responses')
          .insert({
            poll_definition_id: poll.id,
            user_id: testUserId,
            slide_id: 'test-slide',
            user_agent: 'Supabase Integration Test',
            screen_size: '1920x1080'
          })
          .select()
          .limit(1);
          
        if (responseError || !response || response.length === 0) {
          logTest('Poll Response', false, `Failed to insert poll response: ${responseError?.message || 'No data returned'}`);
        } else {
          // Connect response to option
          const responseId = response[0].id;
          
          const { error: linkError } = await supabase
            .from('poll_response_options')
            .insert({
              poll_response_id: responseId,
              poll_option_id: option.id
            });
            
          logTest('Poll Response', !linkError, linkError 
            ? `Failed to link response to option: ${linkError.message}` 
            : `Successfully submitted test poll response for ${poll.poll_id}`);
            
          // Clean up test data
          try {
            await supabase.from('poll_response_options').delete().eq('poll_response_id', responseId);
            await supabase.from('poll_responses').delete().eq('id', responseId);
            console.log('  (Test data cleaned up successfully)');
          } catch (cleanupError) {
            console.warn('  (Warning: Could not clean up test data)');
          }
        }
      }
    }
  } catch (error) {
    logTest('Poll Response', false, `Exception: ${error.message}`);
  }
  
  // Test 6: Check Response Retrieval API
  try {
    console.log('\nTest 6: Testing Poll Results Retrieval');
    
    // Get the first poll
    const { data: polls, error: pollError } = await supabase
      .from('poll_definitions')
      .select('id, poll_id')
      .limit(1);
      
    if (pollError || !polls || polls.length === 0) {
      logTest('Results Retrieval', false, 'Could not fetch any polls');
    } else {
      const poll = polls[0];
      
      // Construct RPC query for getting results
      const { data: results, error: resultsError } = await supabase.rpc('get_poll_responses_for_contact', {
        p_user_id: '',  // we're not looking for a specific user
        p_ip_hash: '',
        p_contact_unique_id: ''
      });
      
      // Simple count query as fallback
      const { count, error: countError } = await supabase
        .from('poll_responses')
        .select('*', { count: 'exact', head: true });
      
      if (resultsError && countError) {
        logTest('Results Retrieval', false, `Error retrieving results: ${resultsError.message || countError.message}`);
      } else {
        if (results) {
          logTest('Results Retrieval', true, `Successfully retrieved ${results.length} poll responses`);
        } else if (count !== undefined) {
          logTest('Results Retrieval', true, `Successfully counted ${count} poll responses (RPC not available)`);
        } else {
          logTest('Results Retrieval', false, 'Could not retrieve poll responses');
        }
      }
    }
  } catch (error) {
    logTest('Results Retrieval', false, `Exception: ${error.message}`);
  }
  
  // Print summary
  console.log('\n=================================================================');
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('✅ All Supabase integration tests passed!');
  } else {
    console.log(`❌ ${totalTests - passedTests} tests failed.`);
  }
  console.log('=================================================================');
}

// Run the tests
runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
