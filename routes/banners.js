const express = require('express');
const router = express.Router();
const multer = require('multer');
const Banner = require('../models/Banner');
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
const upload = multer({    storage: storage,
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

// Get all banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active banners only
router.get('/active', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single banner by ID
router.get('/:id', async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new banner
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        console.log('Creating banner with:', {
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

        const bannerData = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            button1Text: req.body.button1Text,
            button1Link: req.body.button1Link,
            button2Text: req.body.button2Text,
            button2Link: req.body.button2Link,
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            try {
                console.log('Uploading to Cloudinary...');
                const result = await uploadToCloudinary(req.file, 'banners');
                console.log('Cloudinary result:', result);
                
                bannerData.imageUrl = result.secure_url;
                bannerData.cloudinaryPublicId = result.public_id;
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                throw new Error('Failed to upload image to Cloudinary');
            }
        } else if (req.body.imagePath) {
            bannerData.imagePath = req.body.imagePath;
        }

        const banner = new Banner(bannerData);
        await banner.save();

        res.status(201).json({
            message: req.file ? 'Banner created with Cloudinary image' : 'Banner created with image path',
            banner,
            cloudinary: req.file ? {
                url: bannerData.imageUrl,
                publicId: bannerData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update banner
router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const updateData = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            button1Text: req.body.button1Text,
            button1Link: req.body.button1Link,
            button2Text: req.body.button2Text,
            button2Link: req.body.button2Link,
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            // Delete old image from Cloudinary if exists
            if (banner.cloudinaryPublicId) {
                console.log('Deleting old image from Cloudinary:', banner.cloudinaryPublicId);
                await cloudinary.uploader.destroy(banner.cloudinaryPublicId);
            }

            // Upload new image to Cloudinary
            console.log('Uploading new image to Cloudinary...');
            const result = await uploadToCloudinary(req.file, 'banners');
            console.log('Cloudinary upload result:', result);

            updateData.imageUrl = result.secure_url;
            updateData.cloudinaryPublicId = result.public_id;
            updateData.imagePath = null; // Clear imagePath when using Cloudinary
        } else if (req.body.imagePath) {
            updateData.imagePath = req.body.imagePath;
            updateData.imageUrl = null; // Clear imageUrl when using imagePath
            if (banner.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(banner.cloudinaryPublicId);
                updateData.cloudinaryPublicId = null;
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            message: req.file ? 'Banner updated with new Cloudinary image' : 'Banner updated',
            banner: updatedBanner,
            cloudinary: req.file ? {
                url: updateData.imageUrl,
                publicId: updateData.cloudinaryPublicId
            } : null
        });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(400).json({ message: error.message });
    }
});

// Toggle banner status
router.patch('/:id/toggle', isAuthenticated, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            banner
        });
    } catch (error) {
        console.error('Error toggling banner status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete banner
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }        // Delete image from Cloudinary if exists
        if (banner.cloudinaryPublicId) {
            try {
                console.log('Deleting image from Cloudinary:', banner.cloudinaryPublicId);
                await cloudinary.uploader.destroy(banner.cloudinaryPublicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
                // Continue with banner deletion even if Cloudinary deletion fails
            }
        }

        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;