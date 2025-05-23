const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadToCloudinary = async (file, folder = 'general') => {
    if (!file || !file.buffer) {
        console.error('Invalid file object:', file);
        throw new Error('Invalid file object');
    }

    console.log('Starting Cloudinary upload:', {
        folder,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
    });

    return new Promise((resolve, reject) => {
        try {            // Handle SVGs differently
            const isSVG = file.mimetype === 'image/svg+xml';
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: isSVG ? 'raw' : 'auto',
                    format: isSVG ? 'svg' : undefined,
                    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg']
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(error);
                    }
                    console.log('Cloudinary upload success:', {
                        publicId: result.public_id,
                        url: result.secure_url,
                        format: result.format,
                        size: result.bytes
                    });
                    resolve(result);
                }
            );

            // Convert buffer to stream
            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
        } catch (error) {
            console.error('Error in upload process:', error);
            reject(error);
        }
    });
};

module.exports = {
    uploadToCloudinary
};
