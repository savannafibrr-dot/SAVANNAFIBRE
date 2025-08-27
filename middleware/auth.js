// Middleware to check if user is authenticated
function auth(req, res, next) {
    // Check if user is authenticated via session
    if (req.isAuthenticated()) {
        return next();
    }
    
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized - Please log in first' });
    }
    
    // For page requests, redirect to login
    res.redirect('/login.html');
}

module.exports = auth; 