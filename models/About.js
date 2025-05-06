const mongoose = require('mongoose');

const FeatureBoxSchema = new mongoose.Schema({
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
});

const AboutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    secondaryImage: { type: String, required: true },
    featureBoxes: [FeatureBoxSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('About', AboutSchema); 