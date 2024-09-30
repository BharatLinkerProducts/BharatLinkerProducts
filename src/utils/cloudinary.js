import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary credentials are set correctly
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary configuration in environment variables");
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/**
 * Uploads an image buffer to Cloudinary and returns the URL.
 *
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @returns {Promise<string|null>} The URL of the uploaded file or null if the upload fails.
 */
const uploadOnCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload failed:', error);
                return reject(null); // Reject with null on error
            }
            resolve(result.url);  // Return the uploaded file's URL
        });

        // Create a readable stream from the buffer and pipe it to Cloudinary
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null); // End the stream
        readableStream.pipe(uploadStream);
    });
};

export { uploadOnCloudinary };
