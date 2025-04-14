const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Plan = require('../models/Plan');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/images/plans';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Log file information for debugging
        console.log('File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });

        // Check file type
        if (!file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
            console.log('Invalid file type:', file.mimetype);
            return cb(new Error('Only image files are allowed!'), false);
        }

        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
            console.log('Invalid file extension:', ext);
            return cb(new Error('Only .jpg, .jpeg, .png, .gif, and .svg files are allowed!'), false);
        }

        cb(null, true);
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Get all plans
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new plan
router.post('/', isAuthenticated, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const planData = {
            name: req.body.name,
            type: req.body.type || 'residential', // Default to residential if not specified
            speed: parseInt(req.body.speed),
            price: parseInt(req.body.price),
            supportedDevices: parseInt(req.body.supportedDevices),
            features: JSON.parse(req.body.features),
            isPopular: req.body.isPopular === 'true' || req.body.isPopular === true // Handle both string and boolean
        };

        if (req.file) {
            planData.imageUrl = `/images/plans/${req.file.filename}`;
        }

        const plan = new Plan(planData);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        console.error('Error creating plan:', error);
        // If there was an error and a file was uploaded, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(400).json({ error: error.message || 'Invalid data' });
    }
});

// Get single plan
router.get('/:id', async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update plan
router.put('/:id', isAuthenticated, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const planData = {
            name: req.body.name,
            type: req.body.type || plan.type, // Keep existing type if not provided
            speed: parseInt(req.body.speed),
            price: parseInt(req.body.price),
            supportedDevices: parseInt(req.body.supportedDevices),
            features: JSON.parse(req.body.features),
            isPopular: req.body.isPopular === 'true' || req.body.isPopular === true // Handle both string and boolean
        };

        // If a new image is uploaded
        if (req.file) {
            // Delete the old image if it exists
            if (plan.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', plan.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            planData.imageUrl = `/images/plans/${req.file.filename}`;
        }

        const updatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            planData,
            { new: true }
        );

        res.json(updatedPlan);
    } catch (error) {
        console.error('Error updating plan:', error);
        // If there was an error and a file was uploaded, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(400).json({ error: error.message || 'Invalid data' });
    }
});

// Delete plan
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Delete the image file if it exists
        if (plan.imageUrl) {
            const imagePath = path.join(__dirname, '..', plan.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 