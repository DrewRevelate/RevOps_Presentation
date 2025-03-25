// Script to create and populate Supabase tables for testing
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Use environment variables from config
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.key;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabaseTables() {
  console.log('🚀 Setting up Supabase tables for FullThrottle presentation');
  console.log('========================================================');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  // Check connection first
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase');
  } catch (err) {
    console.error('❌ Unexpected error testing authentication:', err.message);
    return;
  }
  
  // Step 1: Create tables using Supabase's SQL functionality
  console.log('\nStep 1: Attempting to create required tables');
  
  const createTablesQuery = `
  -- Poll Definitions Table
  CREATE TABLE IF NOT EXISTS poll_definitions (
      id SERIAL PRIMARY KEY,
      poll_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Poll Options Table
  CREATE TABLE IF NOT EXISTS poll_options (
      id SERIAL PRIMARY KEY,
      poll_definition_id INTEGER NOT NULL,
      option_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      UNIQUE(poll_definition_id, option_id)
  );
  
  -- Poll Responses Table
  CREATE TABLE IF NOT EXISTS poll_responses (
      id SERIAL PRIMARY KEY,
      poll_definition_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      slide_id TEXT,
      user_agent TEXT,
      ip_address TEXT,
      ip_hash TEXT,
      unique_id TEXT,
      contact_unique_id TEXT,
      screen_size TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Poll Response Options
  CREATE TABLE IF NOT EXISTS poll_response_options (
      id SERIAL PRIMARY KEY,
      poll_response_id INTEGER NOT NULL,
      poll_option_id INTEGER NOT NULL,
      UNIQUE(poll_response_id, poll_option_id)
  );
  
  -- Contact Form Submissions Table
  CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      major TEXT,
      grad_year TEXT,
      career_goals TEXT,
      session_id TEXT,
      user_agent TEXT,
      ip_address TEXT,
      ip_hash TEXT,
      unique_id TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      user_id TEXT,
      screen_size TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Contact Tags Table
  CREATE TABLE IF NOT EXISTS contact_tags (
      id SERIAL PRIMARY KEY,
      tag_name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Contact Tag Mapping
  CREATE TABLE IF NOT EXISTS contact_tag_mapping (
      id SERIAL PRIMARY KEY,
      contact_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      UNIQUE(contact_id, tag_id)
  );
  
  -- Contact Interactions Table
  CREATE TABLE IF NOT EXISTS contact_interactions (
      id SERIAL PRIMARY KEY,
      contact_id INTEGER NOT NULL,
      interaction_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  
  try {
    await supabase.sql(createTablesQuery);
    console.log('✅ Successfully created tables');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.log('This may be due to insufficient permissions');
    console.log('The tables may already exist - attempting to continue with data insertion');
  }
  
  // Step 2: Create test polls
  console.log('\nStep 2: Setting up test polls');
  
  // First poll: Time Management on slide 2
  try {
    // Check if poll exists first
    const { data: existingPoll, error: checkError } = await supabase
      .from('poll_definitions')
      .select('id')
      .eq('poll_id', 'slide-2-default')
      .limit(1);
      
    if (checkError) {
      console.error('❌ Error checking for existing poll:', checkError.message);
    } else if (existingPoll && existingPoll.length > 0) {
      console.log('✅ Poll "slide-2-default" already exists');
      
      // Update to make sure it's active
      await supabase
        .from('poll_definitions')
        .update({ is_active: 1 })
        .eq('poll_id', 'slide-2-default');
    } else {
      // Create the poll definition
      const { data: pollData, error: pollError } = await supabase
        .from('poll_definitions')
        .insert({
          poll_id: 'slide-2-default',
          title: 'Time Management',
          description: 'What would you do with 5 extra hours per week?',
          is_active: 1
        })
        .select();
        
      if (pollError) {
        console.error('❌ Error creating poll definition:', pollError.message);
      } else if (pollData && pollData.length > 0) {
        console.log('✅ Created poll definition: slide-2-default');
        
        // Create poll options
        const pollId = pollData[0].id;
        const options = [
          { poll_definition_id: pollId, option_id: 'prospecting', option_text: 'More prospecting', display_order: 1 },
          { poll_definition_id: pollId, option_id: 'client-meetings', option_text: 'Additional client meetings', display_order: 2 },
          { poll_definition_id: pollId, option_id: 'learning', option_text: 'Learning new skills', display_order: 3 },
          { poll_definition_id: pollId, option_id: 'planning', option_text: 'Strategic planning', display_order: 4 },
          { poll_definition_id: pollId, option_id: 'personal', option_text: 'Personal time', display_order: 5 }
        ];
        
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(options);
          
        if (optionsError) {
          console.error('❌ Error creating poll options:', optionsError.message);
        } else {
          console.log('✅ Created 5 options for poll: slide-2-default');
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error setting up poll 1:', error.message);
  }
  
  // Second poll: Sales Skills on slide 5
  try {
    // Check if poll exists first
    const { data: existingPoll, error: checkError } = await supabase
      .from('poll_definitions')
      .select('id')
      .eq('poll_id', 'slide-5-student-skills')
      .limit(1);
      
    if (checkError) {
      console.error('❌ Error checking for existing poll:', checkError.message);
    } else if (existingPoll && existingPoll.length > 0) {
      console.log('✅ Poll "slide-5-student-skills" already exists');
      
      // Update to make sure it's active
      await supabase
        .from('poll_definitions')
        .update({ is_active: 1 })
        .eq('poll_id', 'slide-5-student-skills');
    } else {
      // Create the poll definition
      const { data: pollData, error: pollError } = await supabase
        .from('poll_definitions')
        .insert({
          poll_id: 'slide-5-student-skills',
          title: 'Sales Skills',
          description: 'For your first sales role, which skills would you prioritize developing?',
          is_active: 1
        })
        .select();
        
      if (pollError) {
        console.error('❌ Error creating poll definition:', pollError.message);
      } else if (pollData && pollData.length > 0) {
        console.log('✅ Created poll definition: slide-5-student-skills');
        
        // Create poll options
        const pollId = pollData[0].id;
        const options = [
          { poll_definition_id: pollId, option_id: 'technical', option_text: 'Technical skills', display_order: 1 },
          { poll_definition_id: pollId, option_id: 'relationship', option_text: 'Relationship-building skills', display_order: 2 },
          { poll_definition_id: pollId, option_id: 'strategic', option_text: 'Strategic skills', display_order: 3 },
          { poll_definition_id: pollId, option_id: 'execution', option_text: 'Execution skills', display_order: 4 }
        ];
        
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(options);
          
        if (optionsError) {
          console.error('❌ Error creating poll options:', optionsError.message);
        } else {
          console.log('✅ Created 4 options for poll: slide-5-student-skills');
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error setting up poll 2:', error.message);
  }
  
  console.log('\n✨ Setup completed');
}

// Run the setup
setupSupabaseTables().catch(console.error);
