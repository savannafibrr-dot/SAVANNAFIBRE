const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const About = require('../models/About');
const auth = require('../middleware/auth');

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/uploads/about');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, 'about-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// GET About info
router.get('/', async (req, res) => {
    try {
        let about = await About.findOne().sort({ createdAt: -1 });
        if (!about) {
            // Create default about info if none exists
            about = await About.create({
                title: 'Your Essential Connection for Everyday Living',
                subtitle: 'About Our Internet',
                description: 'At Savanna Fibre, we believe the internet is more than just a service—it\'s a lifeline. That\'s why we\'re committed to providing fast, reliable, and affordable internet for all households in Tanzania.',
                mainImage: '/assets/images/resources/about-2-1.jpg',
                secondaryImage: '/assets/images/iadded/7.png',
                featureBoxes: [
                    {
                        icon: 'icon-world',
                        title: '24/7 Support',
                        description: 'We\'re here for you, day and night.'
                    },
                    {
                        icon: 'icon-wifi-router',
                        title: 'Fast, Easy Service',
                        description: 'Hassle-free setup and seamless browsing, streaming, and gaming.'
                    }
                ]
            });
        }
        res.json(about);
    } catch (err) {
        console.error('Error fetching about info:', err);
        res.status(500).json({ error: 'Failed to fetch about info' });
    }
});

// UPDATE About info (protected route)
router.put('/', auth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'secondaryImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let about = await About.findOne().sort({ createdAt: -1 });
        if (!about) about = new About();

        // Update basic info
        about.title = req.body.title;
        about.subtitle = req.body.subtitle;
        about.description = req.body.description;

        // Update images if new ones are uploaded
        if (req.files) {
            if (req.files.mainImage) {
                // Delete old main image if exists
                if (about.mainImage && about.mainImage.startsWith('/uploads/about')) {
                    const oldPath = path.join(__dirname, '..', about.mainImage);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                about.mainImage = '/uploads/about/' + req.files.mainImage[0].filename;
            }
            if (req.files.secondaryImage) {
                // Delete old secondary image if exists
                if (about.secondaryImage && about.secondaryImage.startsWith('/uploads/about')) {
                    const oldPath = path.join(__dirname, '..', about.secondaryImage);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                about.secondaryImage = '/uploads/about/' + req.files.secondaryImage[0].filename;
            }
        }

        // Update feature boxes
        if (req.body.featureBoxes) {
            about.featureBoxes = JSON.parse(req.body.featureBoxes);
        }

        about.updatedAt = new Date();
        await about.save();
        res.json(about);
    } catch (err) {
        console.error('Error updating about info:', err);
        res.status(500).json({ error: 'Failed to update about info' });
    }
});

module.exports = router; 