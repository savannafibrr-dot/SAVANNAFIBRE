const express = require('express');
const router = express.Router();
const multer = require('multer');
const About = require('../models/About');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/upload');
const cloudinary = require('../config/cloudinary');

// Multer setup for memory storage (to send to Cloudinary)
const upload = multer({ 
    storage: multer.memoryStorage(),
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
                mainImage: '',
                secondaryImage: '',
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
                try {
                    console.log('Uploading main image to Cloudinary...');
                    // Delete old main image from Cloudinary if exists
                    if (about.mainImageCloudinaryId) {
                        console.log('Deleting old main image from Cloudinary:', about.mainImageCloudinaryId);
                        await cloudinary.uploader.destroy(about.mainImageCloudinaryId);
                    }
                    
                    const result = await uploadToCloudinary(req.files.mainImage[0], 'about');
                    console.log('Main image Cloudinary upload successful:', {
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        size: result.bytes
                    });
                    about.mainImage = result.secure_url;
                    about.mainImageCloudinaryId = result.public_id;
                } catch (uploadError) {
                    console.error('Error uploading main image to Cloudinary:', uploadError);
                    return res.status(500).json({ error: 'Failed to upload main image' });
                }
            }
            if (req.files.secondaryImage) {
                try {
                    console.log('Uploading secondary image to Cloudinary...');
                    // Delete old secondary image from Cloudinary if exists
                    if (about.secondaryImageCloudinaryId) {
                        console.log('Deleting old secondary image from Cloudinary:', about.secondaryImageCloudinaryId);
                        await cloudinary.uploader.destroy(about.secondaryImageCloudinaryId);
                    }
                    
                    const result = await uploadToCloudinary(req.files.secondaryImage[0], 'about');
                    console.log('Secondary image Cloudinary upload successful:', {
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        size: result.bytes
                    });
                    about.secondaryImage = result.secure_url;
                    about.secondaryImageCloudinaryId = result.public_id;
                } catch (uploadError) {
                    console.error('Error uploading secondary image to Cloudinary:', uploadError);
                    return res.status(500).json({ error: 'Failed to upload secondary image' });
                }
            }
        }

        // Handle image deletions
        if (req.body.deleteMainImage === 'true') {
            console.log('Deleting main image from Cloudinary...');
            if (about.mainImageCloudinaryId) {
                try {
                    await cloudinary.uploader.destroy(about.mainImageCloudinaryId);
                    console.log('Main image deleted from Cloudinary successfully');
                } catch (deleteError) {
                    console.error('Error deleting main image from Cloudinary:', deleteError);
                }
            }
            about.mainImage = '';
            about.mainImageCloudinaryId = '';
            console.log('Main image fields cleared in database');
        }

        if (req.body.deleteSecondaryImage === 'true') {
            console.log('Deleting secondary image from Cloudinary...');
            if (about.secondaryImageCloudinaryId) {
                try {
                    await cloudinary.uploader.destroy(about.secondaryImageCloudinaryId);
                    console.log('Secondary image deleted from Cloudinary successfully');
                } catch (deleteError) {
                    console.error('Error deleting secondary image from Cloudinary:', deleteError);
                }
            }
            about.secondaryImage = '';
            about.secondaryImageCloudinaryId = '';
            console.log('Secondary image fields cleared in database');
        }

        // Update feature boxes
        if (req.body.featureBoxes) {
            about.featureBoxes = JSON.parse(req.body.featureBoxes);
        }

        // Ensure we have valid data before saving
        if (!about.title || !about.subtitle || !about.description) {
            return res.status(400).json({ error: 'Title, subtitle, and description are required' });
        }

        about.updatedAt = new Date();
        
        console.log('About data before save:', {
            title: about.title,
            subtitle: about.subtitle,
            description: about.description,
            mainImage: about.mainImage,
            secondaryImage: about.secondaryImage,
            mainImageCloudinaryId: about.mainImageCloudinaryId,
            secondaryImageCloudinaryId: about.secondaryImageCloudinaryId
        });
        
        await about.save();
        
        // Return response with Cloudinary info
        res.json({
            message: 'About section updated successfully',
            about: about,
            cloudinary: {
                mainImage: req.files?.mainImage ? {
                    url: about.mainImage,
                    publicId: about.mainImageCloudinaryId
                } : null,
                secondaryImage: req.files?.secondaryImage ? {
                    url: about.secondaryImage,
                    publicId: about.secondaryImageCloudinaryId
                } : null
            }
        });
    } catch (err) {
        console.error('Error updating about info:', err);
        res.status(500).json({ error: 'Failed to update about info' });
    }
});

module.exports = router; 