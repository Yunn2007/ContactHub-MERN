/**
 * ==============================================================================
 * Contact Mongoose Model
 * ==============================================================================
 * Defines the MongoDB schema for contact records. Every contact document is
 * linked to an authenticated user (`user` reference), guaranteeing strict
 * multi-tenant data isolation and ownership enforcement.
 * ==============================================================================
 */

import mongoose from "mongoose";

// Define the schema for storing contact information
const contactSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this contact (Foreign Key / ObjectId)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Contact must belong to an authenticated user."],
      index: true, // Speeds up queries filtering by owner
    },

    // Contact's full name (Primary identifier)
    name: {
      type: String,
      required: [true, "Contact name is required."],
      trim: true,
    },

    // Contact's primary email address
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // Primary telephone number (used for native click-to-call links)
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // Alternate / secondary phone number
    secondaryPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // Organization or workplace name
    company: {
      type: String,
      trim: true,
      default: "",
    },

    // Job title or professional designation
    designation: {
      type: String,
      trim: true,
      default: "",
    },

    // Categorical classification for filtering and grouping
    category: {
      type: String,
      trim: true,
      enum: {
        values: ["Work", "Family", "Friends", "Others"],
        message: "{VALUE} is not a supported category.",
      },
      default: "Others",
    },

    // Physical mailing address or location
    address: {
      type: String,
      trim: true,
      default: "",
    },

    // Additional notes or personal reminders regarding the contact
    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Secure Cloudinary HTTPS URL for the contact's avatar
    profileImage: {
      type: String,
      default: "",
    },

    // Cloudinary public ID for replacing or deleting the asset from cloud storage
    profileImagePublicId: {
      type: String,
      default: "",
    },

    // Bookmark / favorite toggle flag
    isFavorite: {
      type: Boolean,
      default: false,
      index: true, // Enables fast filtering on the Favorites screen
    },
  },
  {
    // Automatically creates and maintains createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Compound index to optimize alphabetical sorting and user-specific queries
contactSchema.index({ user: 1, name: 1 });

// Compile schema into the Mongoose model
const Contact = mongoose.model("Contact", contactSchema);

export default Contact;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Mongoose Schema & Data Modeling:
   Defines the blueprint for documents inside the "contacts" collection.
   Enforces type safety, required constraints, trims whitespace, and assigns defaults.

2. Document Relationships & References (`ref: "User"`):
   The `user` field stores a MongoDB ObjectId referencing the `User` model.
   This establishes a one-to-many relationship: one user owns many contacts.

3. MongoDB Indexes (`index: true` & compound index):
   Indexes act as lookup tables for MongoDB, avoiding full collection scans
   (COLLSCAN) and ensuring instantaneous queries when searching or sorting
   by user, name, or favorite status.

4. Schema Enums (`enum` validation):
   Restricts the `category` field to allowed values ("Work", "Family", "Friends", "Others"),
   protecting database integrity against arbitrary strings.

5. Cloud Storage Pointer Pattern:
   Instead of bloating MongoDB with large binary image data (Base64 or GridFS),
   the model only stores the Cloudinary URL and publicId. This keeps database
   documents lightweight and fast to read/write.
==================================================
*/

