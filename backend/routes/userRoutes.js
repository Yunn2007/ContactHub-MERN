/**
 * ==============================================================================
 * User Routes
 * ==============================================================================
 * Express routing layer for authenticated user profile operations, password
 * updates, and client preferences. Guarded by the JWT `protect` middleware.
 * ==============================================================================
 */

import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updatePreferences,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Enforce JWT authentication on all user routes
router.use(protect);

// User profile retrieval and modification
router.get("/profile", getUserProfile);
router.put("/profile", upload.single("image"), updateUserProfile);

// Account security
router.patch("/change-password", changePassword);

// UI preferences
router.patch("/preferences", updatePreferences);

export default router;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. HTTP Verb Semantics:
   - GET: Safe retrieval of user profile without modifying server state.
   - PUT: Updating user profile resources (idempotent replacement).
   - PATCH: Partial updates for password change or specific preference fields.

2. Middleware Composition:
   Chaining `protect` and `upload.single("image")` demonstrates how Express
   middleware processes requests sequentially: authentication first, then
   multipart parsing, then the controller logic.
==================================================
*/

