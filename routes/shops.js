const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'public/uploads/shops';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

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
        
        // Add image URL if file was uploaded
        if (req.file) {
            shopData.imageUrl = `/uploads/shops/${req.file.filename}`;
        }

        const shop = new Shop(shopData);
        await shop.save();
        
        console.log('Shop created:', shop); // Debug log
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
        
        // Add image URL if file was uploaded
        if (req.file) {
            // Delete old image if exists
            const oldShop = await Shop.findById(req.params.id);
            if (oldShop && oldShop.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', 'public', oldShop.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            shopData.imageUrl = `/uploads/shops/${req.file.filename}`;
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

        // Delete image file if exists
        if (shop.imageUrl) {
            const imagePath = path.join(__dirname, '..', 'public', shop.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await shop.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 