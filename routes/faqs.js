const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const auth = require('../middleware/auth');

// Get all FAQs (public)
router.get('/', async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ category: 1, order: 1 });
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

// Get single FAQ (public)
router.get('/:id', async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ error: 'Not found' });
        res.json(faq);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
});

// Add new FAQs for a category (admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { category, order, faqs } = req.body;
        if (!category || !Array.isArray(faqs) || faqs.length === 0) {
            return res.status(400).json({ error: 'Category and at least one FAQ are required' });
        }
        // Create all FAQs for this category
        const createdFaqs = await FAQ.insertMany(
            faqs.map(f => ({ category, question: f.question, answer: f.answer, order }))
        );
        res.status(201).json(createdFaqs);
    } catch (err) {
        res.status(400).json({ error: 'Failed to add FAQs' });
    }
});

// Update all FAQs for a category (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { category, order, faqs } = req.body;
        if (!category || !Array.isArray(faqs) || faqs.length === 0) {
            return res.status(400).json({ error: 'Category and at least one FAQ are required' });
        }
        // Find the original FAQ to get the category
        const originalFaq = await FAQ.findById(req.params.id);
        if (!originalFaq) return res.status(404).json({ error: 'Not found' });
        // Delete all FAQs in this category
        await FAQ.deleteMany({ category: originalFaq.category });
        // Insert new FAQs for this category
        const updatedFaqs = await FAQ.insertMany(
            faqs.map(f => ({ category, question: f.question, answer: f.answer, order }))
        );
        res.json(updatedFaqs);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update FAQs' });
    }
});

// Delete FAQ (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete FAQ' });
    }
});

module.exports = router; 