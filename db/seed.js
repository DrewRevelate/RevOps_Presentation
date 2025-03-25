// Seed script for Full Throttle presentation
const { db, runSqlScript } = require('./supabase/database');

// Create necessary tables and seed initial data
async function seedAll() {
    try {
        console.log('Starting database seeding...');
        
        // Check if necessary tables exist, create them if they don't
        // First, check the presentation_logs table
        try {
            const { data: logsExist, error: logsError } = await db
                .from('presentation_logs')
                .select('*', { count: 'exact', head: true })
                .limit(1);
            
            if (logsError) {
                console.log('Creating presentation_logs table...');
                // Create the table using the modified runSqlScript function
                await runSqlScript(`
                    CREATE TABLE IF NOT EXISTS presentation_logs (
                        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                        slide TEXT NOT NULL,
                        action TEXT NOT NULL,
                        timestamp TIMESTAMPTZ DEFAULT NOW()
                    );
                `);
                console.log('Created presentation_logs table successfully or it already exists');
            } else {
                console.log('presentation_logs table already exists');
            }
        } catch (error) {
            console.log('Error checking/creating presentation_logs table (non-fatal):', error.message);
        }
        
        // Check poll_responses table
        try {
            const { data: pollExists, error: pollError } = await db
                .from('poll_responses')
                .select('*', { count: 'exact', head: true })
                .limit(1);
            
            if (pollError) {
                console.log('Creating poll_responses table...');
                await runSqlScript(`
                    CREATE TABLE IF NOT EXISTS poll_responses (
                        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                        poll_id TEXT NOT NULL,
                        response TEXT NOT NULL,
                        timestamp TIMESTAMPTZ DEFAULT NOW()
                    );
                `);
                console.log('Created poll_responses table successfully or it already exists');
            } else {
                console.log('poll_responses table already exists');
            }
        } catch (error) {
            console.log('Error checking/creating poll_responses table (non-fatal):', error.message);
        }
        
        // Check presentation_feedback table
        try {
            const { data: feedbackExists, error: feedbackError } = await db
                .from('presentation_feedback')
                .select('*', { count: 'exact', head: true })
                .limit(1);
            
            if (feedbackError) {
                console.log('Creating presentation_feedback table...');
                await runSqlScript(`
                    CREATE TABLE IF NOT EXISTS presentation_feedback (
                        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                        rating INTEGER NOT NULL,
                        comments TEXT,
                        timestamp TIMESTAMPTZ DEFAULT NOW()
                    );
                `);
                console.log('Created presentation_feedback table successfully or it already exists');
            } else {
                console.log('presentation_feedback table already exists');
            }
        } catch (error) {
            console.log('Error checking/creating presentation_feedback table (non-fatal):', error.message);
        }
        
        // Add sample poll data if table is empty
        try {
            const { count, error: countError } = await db
                .from('poll_responses')
                .select('*', { count: 'exact', head: true });
            
            if (countError) {
                console.log('Error checking poll_responses count:', countError.message);
            } else if (count === 0) {
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
                    
                if (seedError) {
                    console.log('Error adding sample poll data:', seedError.message);
                } else {
                    console.log('Added sample poll data successfully');
                }
            } else {
                console.log('Poll data already exists, skipping seed data');
            }
        } catch (error) {
            console.log('Error seeding poll data (non-fatal):', error.message);
        }
        
        console.log('Database seeding completed with fallback mechanisms');
        return { success: true };
    } catch (error) {
        console.error('Error in seedAll function:', error.message);
        return { success: false, error: error.message };
    }
}

// Export the seedAll function
module.exports = { seedAll };
