const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    imageUrl: {
        type: String,
        trim: true
    },
    openingHours: {
        monday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        },
        tuesday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        },
        wednesday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        },
        thursday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        },
        friday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        },
        saturday: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '17:00' }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Shop', shopSchema); 