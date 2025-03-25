-- Schema definition for Full Throttle presentation database

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
    FOREIGN KEY (poll_definition_id) REFERENCES poll_definitions(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_definition_id) REFERENCES poll_definitions(id) ON DELETE CASCADE
);

-- Poll Response Options (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS poll_response_options (
    id SERIAL PRIMARY KEY,
    poll_response_id INTEGER NOT NULL,
    poll_option_id INTEGER NOT NULL,
    FOREIGN KEY (poll_response_id) REFERENCES poll_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
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

-- Contact Tag Mapping (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS contact_tag_mapping (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contact_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES contact_tags(id) ON DELETE CASCADE,
    UNIQUE(contact_id, tag_id)
);

-- Contact Interactions Table
CREATE TABLE IF NOT EXISTS contact_interactions (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL,
    interaction_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contact_submissions(id) ON DELETE CASCADE
);
