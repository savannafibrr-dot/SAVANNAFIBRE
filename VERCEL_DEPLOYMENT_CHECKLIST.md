# Vercel Deployment Checklist

## Environment Variables Required

Make sure to set these environment variables in your Vercel project settings:

### Database
- `MONGODB_URI` - Your MongoDB connection string

### Authentication
- `SESSION_SECRET` - A secure random string for session encryption

### Cloudinary (for image uploads)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Email Configuration
- `CUSTOMER_EMAIL` - Email address for sending emails
- `CUSTOMER_EMAIL_PASSWORD` - Password for the email account
- `SALES_EMAIL` - Sales team email address
- `SUPPORT_EMAIL` - Support team email address

### External Services
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

## Steps to Fix 404 Error

1. **Set Environment Variables**: Go to your Vercel dashboard → Project Settings → Environment Variables
2. **Add all required variables** listed above
3. **Redeploy**: Trigger a new deployment after setting environment variables
4. **Test Health Endpoint**: Visit `/health` to check if the server is running properly
5. **Check Logs**: Monitor Vercel function logs for any errors

## Common Issues

1. **Missing Environment Variables**: The most common cause of 404 errors
2. **MongoDB Connection**: Ensure your MongoDB URI is accessible from Vercel
3. **Static File Serving**: Files in `/public` and `/frontend` directories should be served correctly
4. **Route Conflicts**: Make sure route order doesn't cause conflicts

## Testing

After deployment, test these endpoints:
- `/health` - Should return server status
- `/` - Should serve the main page
- `/admin` - Should redirect to login or show admin panel
- `/api/plans` - Should return plans data (if authenticated)

## Debugging

If you still get 404 errors:
1. Check Vercel function logs
2. Test the `/health` endpoint
3. Verify all environment variables are set
4. Check if MongoDB is accessible from Vercel
5. Ensure your domain is properly configured 