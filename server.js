// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Load environment variables if available
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not loaded, using process.env variables');
}

// Environment detection
const isVercel = process.env.VERCEL === '1';
console.log(`Environment: ${isVercel ? 'Vercel' : 'Local'}`);

// Determine base directory for file operations
const baseDir = isVercel ? '/tmp' : __dirname;
console.log(`Base directory for file operations: ${baseDir}`);

// Expose base directory for other modules
global.baseDir = baseDir;

// Always use Supabase
console.log('Using Supabase database');

// Import Supabase database module
const supabaseDb = require('./db/supabase/database');
const db = supabaseDb.db;
const runSqlScript = supabaseDb.runSqlScript;

const { requireAuth, handleLogin, handleLogout } = require('./middleware/auth');

// Create necessary directories for uploads/exports
const dirs = [
    path.join(baseDir, 'data'),
    path.join(baseDir, 'exports'),
    path.join(baseDir, 'backups')
];

// Create directories with proper error handling
try {
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    console.log('Directories created or verified successfully');
} catch (error) {
    console.warn('Could not create directories, continuing anyway:', error.message);
}

// Import routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const contactFormRoutes = require('./routes/contact-form');

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
// Enhanced CORS settings to ensure iframe can access resources
app.use(cors({
    origin: '*', // Allow all origins for classroom presentations
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Enhanced logging middleware to debug static file requests
app.use((req, res, next) => {
    if (req.path.includes('.css') || req.path.includes('.js') || req.path.includes('.html') || req.path.includes('.png') || req.path.includes('.jpg') || req.path.includes('.svg')) {
        console.log(`Static file request: ${req.path}`);
    }
    next();
});

// Static file serving with improved path handling
// Add specific handler for styles.css
app.use('/styles.css', (req, res) => {
    console.log('Serving styles.css directly');
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// Add specific handler for script.js
app.use('/script.js', (req, res) => {
    console.log('Serving script.js directly');
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Serve public directory explicitly
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve images directory explicitly
app.use('/images', express.static(path.join(__dirname, 'images')));

// General static file serving
app.use(express.static(__dirname));

// Add health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            vercel: isVercel
        }
    });
});

// Authentication routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

app.post('/admin/auth', handleLogin);
app.get('/admin/logout', handleLogout);

// API routes
app.use('/api', apiRoutes);

// Contact form routes
app.use('/contact', contactFormRoutes);

// Direct routes for presentation slides
app.get('/public/01-introduction.html', (req, res) => {
    console.log('Serving first slide directly');
    res.sendFile(path.join(__dirname, 'public', '01-introduction.html'));
});

// Add specific routes for each slide for better debugging
app.get('/slide/:slideNumber', (req, res) => {
    const slideNumber = req.params.slideNumber.padStart(2, '0');
    const slideFiles = fs.readdirSync(path.join(__dirname, 'public'));
    const slideFile = slideFiles.find(file => file.startsWith(slideNumber + '-'));
    
    if (slideFile) {
        console.log(`Serving slide: ${slideFile}`);
        res.sendFile(path.join(__dirname, 'public', slideFile));
    } else {
        console.error(`Slide ${slideNumber} not found`);
        res.status(404).send(`Slide ${slideNumber} not found`);
    }
});

// Admin routes with authentication
app.use('/admin', requireAuth, adminRoutes);

// Placeholder image API
app.get('/api/placeholder/:width/:height', (req, res) => {
    const width = req.params.width;
    const height = req.params.height;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect width="100%" height="100%" fill="#333333" />
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
                ${width}×${height}
            </text>
        </svg>
    `);
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'The presentation server encountered an error.'
    });
});

// Import seed function
const { seedAll } = require('./db/seed');

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    
    // Only seed in development environment
    if (process.env.NODE_ENV !== 'production') {
        try {
            seedAll().then(() => {
                console.log('Database seeded successfully');
            }).catch(err => {
                console.error('Seed error (non-fatal):', err.message);
            });
        } catch (error) {
            console.error('Failed to start seeding (non-fatal):', error.message);
        }
    } else {
        console.log('Production environment detected, skipping database seeding');
    }
});