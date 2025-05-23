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
        trim: true
    },
    button1Link: {
        type: String,
        trim: true
    },
    button2Text: {
        type: String,
        trim: true
    },
    button2Link: {
        type: String,
        trim: true
    },
    imagePath: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    cloudinaryPublicId: {
        type: String,
        trim: true
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