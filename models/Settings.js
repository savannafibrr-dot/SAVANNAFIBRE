const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Font settings
  fontFamily: { 
    type: String, 
    default: 'Inter',
    enum: ['Inter', 'Outfit', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Arial', 'Helvetica']
  },
  fontSize: { 
    type: String, 
    default: '16px',
    enum: ['12px', '14px', '16px', '18px', '20px', '24px']
  },
  fontWeight: { 
    type: String, 
    default: '400',
    enum: ['300', '400', '500', '600', '700', '900']
  },
  
  // Color settings (for future use)
  primaryColor: { type: String, default: '#F79621' },
  secondaryColor: { type: String, default: '#2d1a00' },
  
  // Other global settings
  siteName: { type: String, default: 'Savanna Fibre' },
  siteDescription: { type: String, default: 'Your Essential Connection for Everyday Living' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
