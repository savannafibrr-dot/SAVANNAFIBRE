const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const multer = require('multer');
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

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Get all shops
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.json(shops);
    } catch (error) {
        console.error('Error getting shops:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new shop
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        // Parse the shop data
        const shopData = JSON.parse(req.body.data);
        
        // Upload image to Cloudinary if file was uploaded
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'shops');
            shopData.imageUrl = result.secure_url;
            shopData.cloudinaryPublicId = result.public_id;
        }

        const shop = new Shop(shopData);
        await shop.save();
        
        console.log('Shop created:', shop);
        res.status(201).json(shop);
    } catch (error) {
        console.error('Error creating shop:', error);
        res.status(400).json({ error: 'Invalid data', details: error.message });
    }
});

// Get single shop
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json(shop);
    } catch (error) {
        console.error('Error getting shop:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update shop
router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        // Parse the shop data
        const shopData = JSON.parse(req.body.data);
        
        // Upload new image to Cloudinary if file was uploaded
        if (req.file) {
            // Delete old image from Cloudinary if exists
            const oldShop = await Shop.findById(req.params.id);
            if (oldShop && oldShop.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(oldShop.cloudinaryPublicId);
            }

            // Upload new image
            const result = await uploadToCloudinary(req.file, 'shops');
            shopData.imageUrl = result.secure_url;
            shopData.cloudinaryPublicId = result.public_id;
        }

        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            shopData,
            { new: true }
        );
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json(shop);
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(400).json({ error: 'Invalid data', details: error.message });
    }
});

// Delete shop
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Delete image from Cloudinary if exists
        if (shop.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(shop.cloudinaryPublicId);
        }

        await shop.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;