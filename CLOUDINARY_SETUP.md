# Cloudinary Setup for About Section

## Overview
The About section now uses Cloudinary for image storage instead of local file storage. This provides better performance, scalability, and image optimization.

## Environment Variables Required
Create a `.env` file in your project root with the following variables:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to Get Cloudinary Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up or log in to your account
3. Go to Dashboard > Account Details
4. Copy your Cloud Name, API Key, and API Secret

## Features

### Admin Panel (`/about-admin.html`)
- Upload new images for main and secondary about images
- Images are automatically uploaded to Cloudinary
- Old images are automatically deleted from Cloudinary when replaced
- Real-time preview of uploaded images
- Manage feature boxes with icons and descriptions

### Frontend (`/about.html`)
- Automatically loads content from the API
- Displays Cloudinary-optimized images
- Responsive design with fallback content
- Dynamic feature boxes based on admin configuration

## API Endpoints

### GET `/api/about`
- Returns current about information
- Includes image URLs and feature boxes
- No authentication required (public endpoint)

### PUT `/api/about`
- Updates about information
- Requires authentication (admin only)
- Accepts multipart form data for image uploads
- Automatically handles Cloudinary uploads and deletions

## Image Management

### Supported Formats
- JPEG, PNG, GIF, SVG
- Maximum file size: 5MB
- Images are stored in the 'about' folder on Cloudinary

### Automatic Cleanup
- Old images are automatically deleted from Cloudinary when replaced
- Prevents storage bloat and unnecessary costs
- Maintains clean Cloudinary account

## Testing

1. Start your server: `npm run dev`
2. Navigate to `/about-admin.html` (requires login)
3. Upload test images
4. Check `/about.html` to see the changes
5. Verify images are loading from Cloudinary URLs

## Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check Cloudinary environment variables
   - Verify file size is under 5MB
   - Check browser console for errors

2. **Images not displaying**
   - Verify Cloudinary URLs are accessible
   - Check if images were uploaded successfully
   - Clear browser cache

3. **Authentication errors**
   - Ensure you're logged in as admin
   - Check session configuration
   - Verify auth middleware is working

### Debug Endpoints

- `/health` - Check server status and environment variables
- `/api/about` - Test about API endpoint

## Migration from Local Storage

If you have existing local images:
1. Upload them through the admin panel
2. Old local files can be safely deleted
3. All new uploads will go to Cloudinary

## Benefits of Cloudinary

- **Performance**: CDN delivery for faster loading
- **Optimization**: Automatic image optimization
- **Scalability**: No local storage limitations
- **Reliability**: Professional image hosting service
- **Cost-effective**: Pay only for what you use
