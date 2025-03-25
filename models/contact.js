// Contact model for Full Throttle presentation
const { db } = require('../db/supabase/database');

// Save a contact form submission
async function saveContactSubmission(contact) {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .insert({
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        major: contact.major || '',
        grad_year: contact.gradYear || '',
        career_goals: contact.careerGoals || '',
        session_id: contact.sessionId || '',
        user_agent: contact.userAgent || '',
        screen_size: contact.screen || '',
        status: 'new'
      })
      .select()
      .limit(1);
      
    if (error) throw error;
    if (!data || !data[0]) throw new Error('Failed to create contact submission');
    
    return { 
      success: true, 
      contact: data[0]
    };
  } catch (error) {
    console.error(`Error saving contact submission:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Get all contact submissions with pagination
async function getAllContactSubmissions(page = 1, pageSize = 20) {
  try {
    const offset = (page - 1) * pageSize;
    const { data, error, count } = await db
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error getting contact submissions:`, error.message);
    return [];
  }
}

// Get a contact submission by ID
async function getContactSubmissionById(id) {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting contact submission ${id}:`, error.message);
    return null;
  }
}

// Update a contact submission
async function updateContactSubmission(id, updates) {
  try {
    const { data, error } = await db
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .limit(1);
      
    if (error) throw error;
    if (!data || !data[0]) throw new Error(`Contact submission not found: ${id}`);
    
    return { 
      success: true, 
      contact: data[0]
    };
  } catch (error) {
    console.error(`Error updating contact submission ${id}:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

module.exports = {
  saveContactSubmission,
  getAllContactSubmissions,
  getContactSubmissionById,
  updateContactSubmission
};
