// Seed script for Full Throttle presentation
const { db } = require('./supabase/database');

// Create necessary tables and seed initial data
async function seedAll() {
    try {
        console.log('Starting database seeding...');
        
        // Create presentation_logs table if it doesn't exist
        const { error: logsError } = await db.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS presentation_logs (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    slide TEXT NOT NULL,
                    action TEXT NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });
        
        if (logsError) throw logsError;
        console.log('Created presentation_logs table successfully');
        
        // Create poll_responses table if it doesn't exist
        const { error: pollError } = await db.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS poll_responses (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    poll_id TEXT NOT NULL,
                    response TEXT NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });
        
        if (pollError) throw pollError;
        console.log('Created poll_responses table successfully');
        
        // Create presentation_feedback table if it doesn't exist
        const { error: feedbackError } = await db.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS presentation_feedback (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    rating INTEGER NOT NULL,
                    comments TEXT,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });
        
        if (feedbackError) throw feedbackError;
        console.log('Created presentation_feedback table successfully');
        
        // Add sample poll data if table is empty
        const { count, error: countError } = await db
            .from('poll_responses')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        if (count === 0) {
            // Add some starter data for polls
            const samplePollData = [
                { poll_id: 'revops-implementation', response: 'yes', timestamp: new Date().toISOString() },
                { poll_id: 'revops-implementation', response: 'partial', timestamp: new Date().toISOString() },
                { poll_id: 'revops-implementation', response: 'partial', timestamp: new Date().toISOString() },
                { poll_id: 'revops-implementation', response: 'no', timestamp: new Date().toISOString() },
                { poll_id: 'business-rules-challenges', response: 'complexity', timestamp: new Date().toISOString() },
                { poll_id: 'business-rules-challenges', response: 'maintenance', timestamp: new Date().toISOString() },
                { poll_id: 'attribution-model-usage', response: 'first', timestamp: new Date().toISOString() },
                { poll_id: 'attribution-model-usage', response: 'last', timestamp: new Date().toISOString() },
            ];
            
            const { error: seedError } = await db
                .from('poll_responses')
                .insert(samplePollData);
                
            if (seedError) throw seedError;
            console.log('Added sample poll data successfully');
        } else {
            console.log('Poll data already exists, skipping seed data');
        }
        
        console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Error in seedAll function:', error.message);
        throw error;
    }
}

// Export the seedAll function
module.exports = { seedAll };
