// Middleware to check if user is authenticated
function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // For page requests, redirect to login
    res.redirect('/login.html');
}

module.exports = auth; 