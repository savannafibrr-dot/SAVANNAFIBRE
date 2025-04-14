const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        required: true,
        trim: true
    },
    button1Text: {
        type: String,
        required: true,
        trim: true
    },
    button1Link: {
        type: String,
        required: true,
        trim: true
    },
    button2Text: {
        type: String,
        required: true,
        trim: true
    },
    button2Link: {
        type: String,
        required: true,
        trim: true
    },
    imagePath: {
        type: String,
        required: true
    },
    bgColor: {
        type: String,
        required: true,
        default: '#F79621'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', bannerSchema); 