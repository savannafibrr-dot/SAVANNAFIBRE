const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Banner = require('../models/Banner');
const fs = require('fs');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/banners';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, 'banner-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png') {
            return cb(new Error('Only PNG files are allowed!'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Public endpoint to get active banners
router.get('/public', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all banners (admin only)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new banner
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imagePath = req.file.filename; // Store only the filename
        
        const banner = new Banner({
            title: req.body.title,
            subtitle: req.body.subtitle,
            button1Text: req.body.button1Text,
            button1Link: req.body.button1Link,
            button2Text: req.body.button2Text,
            button2Link: req.body.button2Link,
            imagePath: imagePath,
            bgColor: req.body.bgColor,
            isActive: req.body.isActive === 'true'
        });

        const newBanner = await banner.save();
        res.status(201).json(newBanner);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
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

        let imagePath = banner.imagePath;
        if (req.file) {
            // Delete old image
            const oldImagePath = path.join('public/banner-uploads', banner.imagePath);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            imagePath = req.file.filename; // Store only the filename
        }

        banner.title = req.body.title || banner.title;
        banner.subtitle = req.body.subtitle || banner.subtitle;
        banner.button1Text = req.body.button1Text || banner.button1Text;
        banner.button1Link = req.body.button1Link || banner.button1Link;
        banner.button2Text = req.body.button2Text || banner.button2Text;
        banner.button2Link = req.body.button2Link || banner.button2Link;
        banner.imagePath = imagePath;
        banner.bgColor = req.body.bgColor || banner.bgColor;
        banner.isActive = req.body.isActive === 'true';

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ message: error.message });
    }
});

// Delete banner
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Delete image file
        const imagePath = path.join('public/banner-uploads', banner.imagePath);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await banner.deleteOne(); // Using deleteOne instead of remove
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 