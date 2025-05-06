const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    category: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    // 'order' is now for the whole category, not for individual questions
    order: { type: Number, default: 0 }
}, { timestamps: true });

// No need for a compound index on (category, order) since order is per category
// FAQSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('FAQ', FAQSchema); 