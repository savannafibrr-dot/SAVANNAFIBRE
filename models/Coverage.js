const mongoose = require('mongoose');

const coverageSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['covered', 'pending', 'planned'],
        default: 'planned'
    },
    population: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Coverage', coverageSchema); 