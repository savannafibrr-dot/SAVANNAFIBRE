const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Get current settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        fontFamily: 'Inter',
        fontSize: '16px',
        fontWeight: '400',
        primaryColor: '#F79621',
        secondaryColor: '#2d1a00',
        siteName: 'Savanna Fibre',
        siteDescription: 'Your Essential Connection for Everyday Living'
      });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
router.put('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      settings = new Settings();
    }

    // Update settings with provided values
    const { fontFamily, fontSize, fontWeight, primaryColor, secondaryColor, siteName, siteDescription } = req.body;
    
    if (fontFamily) settings.fontFamily = fontFamily;
    if (fontSize) settings.fontSize = fontSize;
    if (fontWeight) settings.fontWeight = fontWeight;
    if (primaryColor) settings.primaryColor = primaryColor;
    if (secondaryColor) settings.secondaryColor = secondaryColor;
    if (siteName) settings.siteName = siteName;
    if (siteDescription) settings.siteDescription = siteDescription;

    settings.updatedAt = new Date();
    await settings.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings: settings
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
