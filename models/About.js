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
    mainImage: { type: String, required: false, default: '' },
    secondaryImage: { type: String, required: false, default: '' },
    mainImageCloudinaryId: { type: String, trim: true },
    secondaryImageCloudinaryId: { type: String, trim: true },
    featureBoxes: [FeatureBoxSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('About', AboutSchema); 