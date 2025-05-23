const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['residential', 'business'],
        default: 'residential'
    },
    speed: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    supportedDevices: { type: Number, required: true, min: 1 },
    features: [{ type: String, required: true, trim: true }],
    imageUrl: { type: String, trim: true },
    cloudinaryPublicId: { type: String, trim: true },
    isPopular: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
