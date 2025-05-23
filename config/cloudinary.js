const cloudinary = require('cloudinary').v2;

// Log Cloudinary configuration status
console.log('Initializing Cloudinary with:', {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
try {
    cloudinary.api.ping().then(() => {
        console.log('Cloudinary configuration verified successfully');
    }).catch(error => {
        console.error('Cloudinary configuration error:', error.message);
    });
} catch (error) {
    console.error('Error verifying Cloudinary configuration:', error);
}

module.exports = cloudinary;
