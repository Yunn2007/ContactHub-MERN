/**
 * ==============================================================================
 * Cloudinary Configuration and Upload Utility (ES Module)
 * ==============================================================================
 * This module initializes the official Cloudinary SDK using credentials
 * stored in environment variables, and exports helper functions for uploading
 * and deleting images in Cloudinary cloud storage without saving temporary
 * files to the local disk.
 * ==============================================================================
 */

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables so credentials are ready
dotenv.config();

// Configure the Cloudinary SDK with your account credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS secure URLs
});

/**
 * Check whether Cloudinary credentials have been provided in .env
 * @returns {boolean} True if all three required Cloudinary keys are present
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_CLOUD_NAME.includes("your_")
  );
};

/**
 * Upload an image file buffer directly to Cloudinary using an upload stream.
 * This avoids writing files to the local server disk, keeping the backend stateless.
 * 
 * @param {Buffer} buffer - The raw binary file buffer from multer (memory storage)
 * @param {string} folder - The destination folder in Cloudinary (e.g. "contact-hub/contacts")
 * @returns {Promise<{ secure_url: string, public_id: string }>} Cloudinary upload response
 */
export const uploadToCloudinary = (buffer, folder = "contact-hub/contacts") => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are not configured, handle gracefully
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary credentials are missing or unconfigured. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env"
        )
      );
    }

    // Create a Cloudinary upload stream with transformation options
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Automatic formatting and quality optimization for fast loading
        fetch_format: "auto",
        quality: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Write the in-memory buffer into the stream and close it
    uploadStream.end(buffer);
  });
};

/**
 * Delete an existing image from Cloudinary using its unique public ID.
 * Prevents orphaned images from taking up cloud storage quota when contacts are deleted or pictures are replaced.
 * 
 * @param {string} publicId - The Cloudinary public identifier for the asset
 * @returns {Promise<any>} Cloudinary destroy response
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (!isCloudinaryConfigured()) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    // Log warning but don't crash main operation if cleanup fails
    console.warn(`Could not delete Cloudinary image (${publicId}):`, error.message);
    return null;
  }
};

export default cloudinary;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Cloudinary SDK (v2):
   The official client library for interacting with Cloudinary's
   REST API. It provides high-level methods to upload, optimize,
   transform, and destroy media assets in cloud storage.

2. Cloudinary Upload Stream:
   Instead of writing an uploaded image to a local folder on the
   server disk, upload_stream allows streaming raw binary buffers
   directly from memory (RAM) straight to Cloudinary's servers.

3. Promises in Asynchronous Node.js:
   The upload_stream method uses traditional Node stream events and
   callbacks. Wrapping it inside new Promise((resolve, reject) => ...)
   converts it into a modern Promise that can be easily awaited with
   async/await syntax in Express controllers.

4. Public ID vs Secure URL:
   - secure_url: The HTTPS address used by browsers to display the image.
   - public_id: The unique identifier Cloudinary assigns to an asset,
     which is required later to delete or replace the image.

5. Environment Variable Protection:
   Sensitive credentials (API Secret, API Key) are read from process.env
   rather than being hardcoded in source code, preventing security leaks.
==================================================
*/

