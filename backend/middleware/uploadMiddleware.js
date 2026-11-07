/**
 * ==============================================================================
 * Multer File Upload Middleware
 * ==============================================================================
 * Configures Multer to accept image uploads using memory storage.
 * The file is kept in memory as a buffer (req.file.buffer) rather than being
 * saved to local disk, making it ready for streaming directly to Cloudinary.
 * ==============================================================================
 */

import multer from "multer";

// Use memory storage so file buffers are kept in RAM for direct Cloudinary streaming
const storage = multer.memoryStorage();

// Validate that only permitted image MIME types are processed
const fileFilter = (req, file, cb) => {
  // Accepted image types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file with a descriptive error
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF image files are allowed."
      ),
      false
    );
  }
};

// Set file size limit (5 Megabytes)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB max
};

// Create the configured multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits,
});

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Multer Middleware:
   A Node.js middleware for handling multipart/form-data, primarily
   used for uploading files through HTML forms.

2. Memory Storage (multer.memoryStorage()):
   Stores files in memory as Node Buffer objects. This is ideal for
   cloud-native architectures because the web server does not need
   writable local disk access and never leaves stray temporary files.

3. File Filter Callback:
   A validation function that inspects the incoming file's mimetype
   before allowing it to be processed, preventing non-image files or
   executable scripts from being uploaded.

4. Upload Size Limits:
   A security guardrail enforcing maximum payload size (5MB) to protect
   the server from denial-of-service (DoS) memory exhaustion attacks.
==================================================
*/

