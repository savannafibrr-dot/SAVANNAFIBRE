const express = require('express');
const router = express.Router();
const multer = require('multer');
const Plan = require('../models/Plan');
const { uploadToCloudinary } = require('../utils/upload');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size should not exceed 5MB' });
        }
        return res.status(400).json({ error: err.message });
    }
    next(err);
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
        const plans = await Plan.find().sort({ position: 1 });
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
            type: req.body.type || 'residential',
            speed: parseInt(req.body.speed),
            price: parseInt(req.body.price),
            supportedDevices: parseInt(req.body.supportedDevices),
            features: JSON.parse(req.body.features),
            isPopular: req.body.isPopular === 'true' || req.body.isPopular === true,
            position: parseInt(req.body.position)
        };        // Upload image to Cloudinary if file was uploaded
        if (req.file) {
            console.log('Uploading image to Cloudinary...');
            const result = await uploadToCloudinary(req.file, 'plans');
            console.log('Cloudinary upload successful:', {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            });
            planData.imageUrl = result.secure_url;
            planData.cloudinaryPublicId = result.public_id;
        }

        const plan = new Plan(planData);
        await plan.save();
        
        // Include a message in the response indicating Cloudinary upload
        res.status(201).json({
            message: req.file ? 'Plan created successfully with Cloudinary image' : 'Plan created successfully',
            plan: plan,
            cloudinary: req.file ? {
                url: planData.imageUrl,
                publicId: planData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error creating plan:', error);
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
            type: req.body.type || plan.type,
            speed: parseInt(req.body.speed),
            price: parseInt(req.body.price),
            supportedDevices: parseInt(req.body.supportedDevices),
            features: JSON.parse(req.body.features),
            isPopular: req.body.isPopular === 'true' || req.body.isPopular === true,
            position: parseInt(req.body.position)
        };        // Upload new image to Cloudinary if file was uploaded
        if (req.file) {
            console.log('Uploading new image to Cloudinary...');
            // Delete old image from Cloudinary if exists
            if (plan.cloudinaryPublicId) {
                console.log('Deleting old image from Cloudinary:', plan.cloudinaryPublicId);
                await cloudinary.uploader.destroy(plan.cloudinaryPublicId);
            }

            // Upload new image
            const result = await uploadToCloudinary(req.file, 'plans');
            console.log('Cloudinary upload successful:', {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            });
            planData.imageUrl = result.secure_url;
            planData.cloudinaryPublicId = result.public_id;
        }

        const updatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            planData,
            { new: true }
        );
        
        // Return response with Cloudinary info
        res.json({
            message: req.file ? 'Plan updated with new Cloudinary image' : 'Plan updated',
            plan: updatedPlan,
            cloudinary: req.file ? {
                url: planData.imageUrl,
                publicId: planData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error updating plan:', error);
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

        // Delete image from Cloudinary if exists
        if (plan.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(plan.cloudinaryPublicId);
        }

        await plan.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test Cloudinary configuration
router.get('/test-cloudinary', async (req, res) => {
    try {
        console.log('Cloudinary Config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: '***' // Don't log the actual secret
        });
        
        // Try to get account info from Cloudinary
        const result = await cloudinary.api.account();
        res.json({
            status: 'success',
            message: 'Cloudinary is configured correctly',
            accountInfo: {
                cloud_name: result.cloud_name,
                plan: result.plan,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Cloudinary Test Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Cloudinary configuration test failed',
            error: error.message
        });
    }
});

module.exports = router;