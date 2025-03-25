// middleware/auth.js
// Simple authentication middleware for admin routes

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fullthrottle2025';

// Middleware to require authentication for admin routes
function requireAuth(req, res, next) {
    const isAuthenticated = req.cookies && req.cookies.isAuthenticated === 'true';
    
    if (isAuthenticated) {
        return next();
    } else {
        // If not authenticated, redirect to login page
        return res.redirect('/admin/login');
    }
}

// Handle login attempts
function handleLogin(req, res) {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set authentication cookie (secure in production)
        res.cookie('isAuthenticated', 'true', { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Redirect to admin dashboard
        res.redirect('/admin');
    } else {
        // Failed login
        res.redirect('/admin/login?error=invalid_credentials');
    }
}

// Handle logout
function handleLogout(req, res) {
    // Clear authentication cookie
    res.clearCookie('isAuthenticated');
    
    // Redirect to login page
    res.redirect('/admin/login');
}

module.exports = {
    requireAuth,
    handleLogin,
    handleLogout
};
