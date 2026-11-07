/**
 * ==============================================================================
 * Contact Routes
 * ==============================================================================
 * Express routing layer for Contact endpoints.
 * All routes are guarded by the `protect` JWT middleware, and file uploads
 * are handled by the `upload` Multer middleware.
 * ==============================================================================
 */

import express from "express";
import {
  getContacts,
  getContactStats,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply JWT authentication middleware to all contact routes
router.use(protect);

// Dashboard statistics endpoint (must be defined before /:id to prevent route shadowing)
router.get("/stats", getContactStats);

// Contact collection endpoints
router.get("/", getContacts);
router.post("/", upload.single("image"), createContact);

// Individual contact endpoints
router.get("/:id", getContactById);
router.put("/:id", upload.single("image"), updateContact);
router.delete("/:id", deleteContact);

// Quick action: Favorite toggle
router.patch("/:id/favorite", toggleFavorite);

export default router;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Express Router:
   An isolated instance of middleware and routes that modularizes
   the application endpoints into clean, maintainable feature sets.

2. Route-Level Middleware (`router.use(protect)`):
   Applies authentication to all routes declared within this router,
   ensuring no unauthenticated request reaches contact controllers.

3. Route Shadowing Prevention:
   Specific routes like `/stats` are placed before parameterized
   routes like `/:id` so Express doesn't mistakenly treat "stats"
   as a contact ID.

4. Multipart Form-Data Handling (`upload.single("image")`):
   Multer intercepts requests with an image attachment, parses the binary
   data into memory, and populates `req.file` for the controller.
==================================================
*/

