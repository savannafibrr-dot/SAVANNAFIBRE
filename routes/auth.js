const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: info.message || 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Session error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Login successful' });
        });
    })(req, res, next);
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user with default role as 'user'
        const user = new User({ 
            email, 
            password,
            role: 'user' // Explicitly set role as 'user'
        });
        await user.save();

        // Auto login after signup
        req.logIn(user, (err) => {
            if (err) {
                console.error('Auto-login error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: 'Signup successful' });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check authentication status
router.get('/status', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
});

// Get current user data
router.get('/user', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
        email: req.user.email,
        role: req.user.role || 'user'
    });
});

module.exports = router; 