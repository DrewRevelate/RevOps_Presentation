// Poll model for Full Throttle presentation
const { db } = require('../db/supabase/database');

// Get poll definition by ID
async function getPollDefinition(pollId) {
  try {
    const { data, error } = await db
      .from('poll_definitions')
      .select('*')
      .eq('poll_id', pollId)
      .limit(1)
      .single();
    
    if (error) throw error;
    
    // Always treat poll as active regardless of database value
    if (data) {
      data.is_active = 1;
    }
    
    return data;
  } catch (error) {
    console.error(`Error getting poll definition for ${pollId}:`, error.message);
    return null;
  }
}

// Get poll options for a poll definition
async function getPollOptions(pollDefinitionId) {
  try {
    const { data, error } = await db
      .from('poll_options')
      .select('*')
      .eq('poll_definition_id', pollDefinitionId)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting poll options for poll definition ${pollDefinitionId}:`, error.message);
    return [];
  }
}

// Get poll results (count of responses for each option)
async function getPollResults(pollId) {
  try {
    // Get poll definition first
    const pollDefinition = await getPollDefinition(pollId);
    if (!pollDefinition) {
      console.error(`Poll definition not found for ${pollId}`);
      return {};
    }
    
    // Get all options for this poll
    const options = await getPollOptions(pollDefinition.id);
    if (options.length === 0) {
      console.error(`No options found for poll ${pollId}`);
      return {};
    }

    // Get response counts for each option
    const results = {};
    for (const option of options) {
      // Initialize with zero counts
      results[option.option_id] = 0;
      
      try {
        // Count responses for this option
        const { count, error } = await db
          .from('poll_response_options')
          .select('poll_response_id', { count: 'exact' })
          .eq('poll_option_id', option.id);
        
        if (!error) {
          results[option.option_id] = count || 0;
        }
      } catch (innerError) {
        console.error(`Error counting responses for option ${option.option_id}:`, innerError.message);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error getting poll results for ${pollId}:`, error.message);
    return {};
  }
}

// Check if a user has already voted in a poll
async function hasUserVoted(pollId, userId) {
  try {
    if (!userId) return false;
    
    // Get poll definition first
    const pollDefinition = await getPollDefinition(pollId);
    if (!pollDefinition) return false;
    
    // Check for existing responses by this user
    const { count, error } = await db
      .from('poll_responses')
      .select('id', { count: 'exact' })
      .eq('poll_definition_id', pollDefinition.id)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return count > 0;
  } catch (error) {
    console.error(`Error checking if user voted:`, error.message);
    return false;
  }
}

// Save a poll response
async function savePollResponse(pollId, userId, selectedOptions, metadata = {}) {
  try {
    // Get poll definition
    const pollDefinition = await getPollDefinition(pollId);
    if (!pollDefinition) throw new Error(`Poll definition not found: ${pollId}`);
    
    // Check if user already voted
    if (userId) {
      const alreadyVoted = await hasUserVoted(pollId, userId);
      if (alreadyVoted) {
        return { 
          success: true, 
          alreadyVoted: true,
          results: await getPollResults(pollId)
        };
      }
    }
    
    // Create poll response
    const { data: responseData, error: responseError } = await db
      .from('poll_responses')
      .insert({
        poll_definition_id: pollDefinition.id,
        user_id: userId,
        slide_id: metadata.slideId || '',
        user_agent: metadata.userAgent || '',
        screen_size: metadata.screen || ''
      })
      .select()
      .limit(1);
      
    if (responseError) throw responseError;
    if (!responseData || !responseData[0]) throw new Error('Failed to create poll response');
    
    const responseId = responseData[0].id;
    
    // Get poll options
    const options = await getPollOptions(pollDefinition.id);
    if (!options.length) throw new Error('No options found for poll');
    
    // Map selected option IDs to option records
    const optionMap = {};
    options.forEach(opt => {
      optionMap[opt.option_id] = opt;
    });
    
    // Create response options (link responses to options)
    for (const selectedOption of selectedOptions) {
      const option = optionMap[selectedOption];
      if (!option) {
        console.warn(`Option not found: ${selectedOption}`);
        continue;
      }
      
      const { error: linkError } = await db
        .from('poll_response_options')
        .insert({
          poll_response_id: responseId,
          poll_option_id: option.id
        });
        
      if (linkError) {
        console.error(`Error linking response to option ${selectedOption}:`, linkError.message);
      }
    }
    
    // Get updated results
    const results = await getPollResults(pollId);
    
    return { 
      success: true, 
      results,
      responseId,
      alreadyVoted: false
    };
  } catch (error) {
    console.error(`Error saving poll response:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Check if poll exists and create if it doesn't
async function ensurePollDefinitionExists(pollId, title, description, options) {
  try {
    // Check if poll already exists
    const existingPoll = await getPollDefinition(pollId);
    if (existingPoll) {
      console.log(`Poll already exists: ${pollId}`);
      return existingPoll;
    }
    
    // Create new poll definition - always set as active
    const { data: pollData, error: pollError } = await db
      .from('poll_definitions')
      .insert({
        poll_id: pollId,
        title: title,
        description: description,
        is_active: 1  // Always create as active
      })
      .select()
      .limit(1);
      
    if (pollError) throw pollError;
    if (!pollData || !pollData[0]) throw new Error('Failed to create poll definition');
    
    const pollDefinitionId = pollData[0].id;
    
    // Create options
    for (let i = 0; i < options.length; i++) {
      const { id: optionId, text: optionText } = options[i];
      
      const { error: optionError } = await db
        .from('poll_options')
        .insert({
          poll_definition_id: pollDefinitionId,
          option_id: optionId,
          option_text: optionText,
          display_order: i + 1
        });
        
      if (optionError) {
        console.error(`Error creating option ${optionId}:`, optionError.message);
      }
    }
    
    return pollData[0];
  } catch (error) {
    console.error(`Error ensuring poll definition exists:`, error.message);
    return null;
  }
}

module.exports = {
  getPollDefinition,
  getPollOptions,
  getPollResults,
  savePollResponse,
  ensurePollDefinitionExists,
  hasUserVoted
};
