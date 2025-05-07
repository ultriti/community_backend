// Import the required dependencies
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Configure cloudinary with your Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Export the cloudinary module as the default export
module.exports = cloudinary;