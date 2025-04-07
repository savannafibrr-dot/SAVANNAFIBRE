const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

// Get all shops
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new shop
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const shop = new Shop(req.body);
        await shop.save();
        res.status(201).json(shop);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Update shop
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json(shop);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Delete shop
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 