// Middleware to check if user is authenticated
function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized - Please log in' });
}

module.exports = auth; 