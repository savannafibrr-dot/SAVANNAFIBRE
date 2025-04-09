const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Coverage Schema
const coverageSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true,
        trim: true
    },
    subregion: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    centerCoordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    path: {
        type: [{
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        }],
        required: true,
        validate: [
            {
                validator: function(path) {
                    return path.length >= 2;
                },
                message: 'Path must have at least 2 points'
            }
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index on center coordinates
coverageSchema.index({ centerCoordinates: '2dsphere' });

const Coverage = mongoose.model('Coverage', coverageSchema);

// Get all coverage areas
router.get('/', auth, async (req, res) => {
    try {
        const coverageAreas = await Coverage.find().sort({ createdAt: -1 });
        res.json(coverageAreas);
    } catch (error) {
        console.error('Error fetching coverage areas:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: error.message
        });
    }
});

// Add new coverage area with path
router.post('/add-coverage', auth, async (req, res) => {
    try {
        const { region, subregion, description, centerCoordinates, path } = req.body;

        // Validate required fields
        if (!region || !subregion || !description || !centerCoordinates || !path) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate coordinates
        if (!centerCoordinates.lat || !centerCoordinates.lng || 
            isNaN(centerCoordinates.lat) || isNaN(centerCoordinates.lng)) {
            return res.status(400).json({ error: 'Invalid center coordinates' });
        }

        // Validate path
        if (!Array.isArray(path) || path.length < 2) {
            return res.status(400).json({ error: 'Path must have at least 2 points' });
        }

        // Validate each point in the path
        for (const point of path) {
            if (!point.lat || !point.lng || isNaN(point.lat) || isNaN(point.lng)) {
                return res.status(400).json({ error: 'Invalid coordinates in path' });
            }
        }

        // Create new coverage area
        const coverage = new Coverage({
            region,
            subregion,
            description,
            centerCoordinates,
            path
        });

        // Save to database
        await coverage.save();

        res.status(201).json({
            message: 'Coverage area added successfully',
            coverage
        });

    } catch (error) {
        console.error('Error adding coverage area:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
});

// Get single coverage area
router.get('/:id', auth, async (req, res) => {
    try {
        const coverage = await Coverage.findById(req.params.id);
        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }
        res.json(coverage);
    } catch (error) {
        console.error('Error fetching coverage area:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: error.message
        });
    }
});

// Update coverage area
router.put('/:id', auth, async (req, res) => {
    try {
        const { region, subregion, description, centerCoordinates, path } = req.body;

        // Validate required fields
        if (!region || !subregion || !description || !centerCoordinates || !path) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate coordinates and path
        if (!centerCoordinates.lat || !centerCoordinates.lng || 
            isNaN(centerCoordinates.lat) || isNaN(centerCoordinates.lng)) {
            return res.status(400).json({ error: 'Invalid center coordinates' });
        }

        if (!Array.isArray(path) || path.length < 2) {
            return res.status(400).json({ error: 'Path must have at least 2 points' });
        }

        const coverage = await Coverage.findByIdAndUpdate(
            req.params.id,
            {
                region,
                subregion,
                description,
                centerCoordinates,
                path
            },
            { new: true, runValidators: true }
        );

        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }

        res.json({
            message: 'Coverage area updated successfully',
            coverage
        });
    } catch (error) {
        console.error('Error updating coverage area:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: error.message
        });
    }
});

// Delete coverage area
router.delete('/:id', auth, async (req, res) => {
    try {
        const coverage = await Coverage.findByIdAndDelete(req.params.id);
        if (!coverage) {
            return res.status(404).json({ error: 'Coverage area not found' });
        }
        res.json({ 
            message: 'Coverage area deleted successfully',
            coverage
        });
    } catch (error) {
        console.error('Error deleting coverage area:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: error.message
        });
    }
});

module.exports = router; 