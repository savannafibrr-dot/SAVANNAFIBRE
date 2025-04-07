const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    speed: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    supportedDevices: { type: Number, required: true, min: 1 },
    features: [{ type: String, required: true, trim: true }],
    imageUrl: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
