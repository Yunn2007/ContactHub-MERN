/**
 * ==============================================================================
 * User Controller
 * ==============================================================================
 * Manages user profile details, Cloudinary avatar updates, secure password
 * modification with current password verification, and user interface preferences.
 * ==============================================================================
 */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * GET /api/users/profile
 * Returns the current authenticated user's profile and preferences.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/users/profile
 * Update user full name, email address, and profile avatar (via Cloudinary).
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { name, email, removeImage } = req.body;

    // Update name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update email with uniqueness check
    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();

      // Check if another account is already registered with this email
      const emailExists = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }, // Exclude the current user
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "This email address is already in use by another account.",
        });
      }

      user.email = normalizedEmail;
    }

    // Handle profile avatar upload to Cloudinary
    if (req.file) {
      // Delete old profile picture from Cloudinary
      if (user.profileImagePublicId) {
        await deleteFromCloudinary(user.profileImagePublicId);
      }

      // Upload new picture
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "contact-hub/users"
        );
        user.profileImage = uploadResult.secure_url;
        user.profileImagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.warn("Avatar upload to Cloudinary failed:", uploadError.message);
      }
    }
    // Handle explicit removal of profile picture
    else if (removeImage === "true" || removeImage === true) {
      if (user.profileImagePublicId) {
        await deleteFromCloudinary(user.profileImagePublicId);
      }
      user.profileImage = "";
      user.profileImagePublicId = "";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/users/change-password
 * Secure password change requiring verification of current password.
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    // Retrieve user including their current password hash
    const user = await User.findById(req.user._id);

    // Verify current password with bcrypt
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    // Hash the new password with salt factor 12
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/users/preferences
 * Persist user interface preferences (defaultSort, defaultCategory, preferredView).
 */
export const updatePreferences = async (req, res) => {
  try {
    const { defaultSort, defaultCategory, preferredView } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update preferences object
    if (!user.preferences) {
      user.preferences = {};
    }

    if (defaultSort) user.preferences.defaultSort = defaultSort;
    if (defaultCategory) user.preferences.defaultCategory = defaultCategory;
    if (preferredView) user.preferences.preferredView = preferredView;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully!",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating preferences.",
      error: error.message,
    });
  }
};

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Secure Credential Verification (bcrypt.compare):
   Passwords are never stored in plaintext. When changing a password,
   bcrypt hashes the incoming currentPassword with the stored salt
   and checks if the hashes match.

2. Uniqueness Validation with Exclusions (`$ne` operator):
   When a user updates their email, MongoDB checks whether the email
   is taken by another document (`_id: { $ne: user._id }`), allowing
   the user to keep their existing email without triggering a collision.

3. Safe Response Projection:
   Passwords and internal metadata are stripped before sending the user
   profile back to the client (`.select("-password")`), preventing
   credential leakage.

4. Stateful Avatar Management:
   Cloudinary publicId enables replacing user profile images cleanly
   in cloud storage, preventing orphaned files from accumulating.
==================================================
*/

