const express = require('express');
const router = express.Router();
const Coverage = require('../models/Coverage');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Get all coverage areas
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const coverageAreas = await Coverage.find().sort({ createdAt: -1 });
        res.json(coverageAreas);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new coverage area
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const coverage = new Coverage(req.body);
        await coverage.save();
        res.status(201).json(coverage);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Get single coverage area
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const coverage = await Coverage.findById(req.params.id);
        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }
        res.json(coverage);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update coverage area
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const coverage = await Coverage.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }
        res.json(coverage);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Delete coverage area
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const coverage = await Coverage.findByIdAndDelete(req.params.id);
        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 