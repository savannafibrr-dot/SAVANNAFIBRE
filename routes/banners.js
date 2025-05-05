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
        const dir = 'public/banner-uploads';
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
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Get all banners
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single banner
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new banner
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        let imagePath;
        
        if (req.file) {
            // If file is uploaded, use the uploaded file path
            imagePath = '/banner-uploads/' + req.file.filename;
        } else if (req.body.imagePath) {
            // If image path is provided, use that
            imagePath = req.body.imagePath;
        } else {
            return res.status(400).json({ message: 'Either an image file or image path is required' });
        }
        
        const banner = new Banner({
            title: req.body.title,
            subtitle: req.body.subtitle,
            button1Text: req.body.button1Text,
            button1Link: req.body.button1Link,
            button2Text: req.body.button2Text,
            button2Link: req.body.button2Link,
            imagePath: imagePath,
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
            // If new file is uploaded, delete old file and use new one
            if (banner.imagePath && !banner.imagePath.startsWith('./')) {
                const oldImagePath = path.join('public', banner.imagePath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagePath = '/banner-uploads/' + req.file.filename;
        } else if (req.body.imagePath) {
            // If new image path is provided, use that
            imagePath = req.body.imagePath;
        }

        banner.title = req.body.title || banner.title;
        banner.subtitle = req.body.subtitle || banner.subtitle;
        banner.button1Text = req.body.button1Text || banner.button1Text;
        banner.button1Link = req.body.button1Link || banner.button1Link;
        banner.button2Text = req.body.button2Text || banner.button2Text;
        banner.button2Link = req.body.button2Link || banner.button2Link;
        banner.imagePath = imagePath;
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

        // Delete image file only if it's an uploaded file
        if (banner.imagePath && !banner.imagePath.startsWith('./')) {
            const imagePath = path.join('public', banner.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await banner.deleteOne();
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