const express = require('express');
const router = express.Router();
const multer = require('multer');
const Accessory = require('../models/Accessory');
const { uploadToCloudinary } = require('../utils/upload');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({    
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept all image types and SVG
        if (!file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
            cb(new Error('Only image files and SVG are allowed'), false);
            return;
        }
        cb(null, true);
    },
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB to accommodate larger SVG files
    }
});

// Get all accessories
router.get('/', async (req, res) => {
    try {
        const accessories = await Accessory.find().sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active accessories only
router.get('/active', async (req, res) => {
    try {
        const accessories = await Accessory.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single accessory by ID
router.get('/:id', async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }
        res.json(accessory);
    } catch (error) {
        console.error('Error fetching accessory:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new accessory
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        console.log('Creating accessory with:', {
            body: req.body,
            file: req.file ? {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : 'No file'
        });

        if (!req.file && !req.body.imagePath) {
            throw new Error('Either image file or image path is required');
        }

        const accessoryData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            try {
                console.log('Uploading to Cloudinary...');
                const result = await uploadToCloudinary(req.file, 'accessories');
                console.log('Cloudinary result:', result);
                
                accessoryData.imageUrl = result.secure_url;
                accessoryData.cloudinaryPublicId = result.public_id;
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                throw new Error('Failed to upload image to Cloudinary');
            }
        } else if (req.body.imagePath) {
            accessoryData.imagePath = req.body.imagePath;
        }

        const accessory = new Accessory(accessoryData);
        await accessory.save();

        res.status(201).json({
            message: req.file ? 'Accessory created with Cloudinary image' : 'Accessory created with image path',
            accessory,
            cloudinary: req.file ? {
                url: accessoryData.imageUrl,
                publicId: accessoryData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error creating accessory:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update accessory
router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }

        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (accessory.cloudinaryPublicId) {
                console.log('Deleting old image from Cloudinary:', accessory.cloudinaryPublicId);
                await cloudinary.uploader.destroy(accessory.cloudinaryPublicId);
            }

            // Upload new image to Cloudinary
            console.log('Uploading new image to Cloudinary...');
            const result = await uploadToCloudinary(req.file, 'accessories');
            console.log('Cloudinary upload result:', result);

            updateData.imageUrl = result.secure_url;
            updateData.cloudinaryPublicId = result.public_id;
            updateData.imagePath = null; // Clear imagePath when using Cloudinary
        } else if (req.body.imagePath) {
            updateData.imagePath = req.body.imagePath;
            updateData.imageUrl = null; // Clear imageUrl when using imagePath
            if (accessory.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(accessory.cloudinaryPublicId);
                updateData.cloudinaryPublicId = null;
            }
        }

        const updatedAccessory = await Accessory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            message: req.file ? 'Accessory updated with new Cloudinary image' : 'Accessory updated',
            accessory: updatedAccessory,
            cloudinary: req.file ? {
                url: updateData.imageUrl,
                publicId: updateData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error updating accessory:', error);
        res.status(400).json({ message: error.message });
    }
});

// Toggle accessory status
router.patch('/:id/toggle', isAuthenticated, async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }

        accessory.isActive = !accessory.isActive;
        await accessory.save();

        res.json({
            message: `Accessory ${accessory.isActive ? 'activated' : 'deactivated'} successfully`,
            accessory
        });
    } catch (error) {
        console.error('Error toggling accessory status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete accessory
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }

        // Delete image from Cloudinary if exists
        if (accessory.cloudinaryPublicId) {
            console.log('Deleting image from Cloudinary:', accessory.cloudinaryPublicId);
            await cloudinary.uploader.destroy(accessory.cloudinaryPublicId);
        }

        await Accessory.findByIdAndDelete(req.params.id);

        res.json({ message: 'Accessory deleted successfully' });
    } catch (error) {
        console.error('Error deleting accessory:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 