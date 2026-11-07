/**
 * ==============================================================================
 * User Mongoose Model
 * ==============================================================================
 * Defines the database schema and model for authenticated Contact Hub users,
 * including authentication credentials, Cloudinary profile image references,
 * and user preferences for sorting and layout.
 * ==============================================================================
 */

import mongoose from "mongoose";

// Define the structure of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },

    // Unique email address used for login
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Salted and hashed password string (bcrypt)
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters."],
    },

    // Cloudinary secure HTTPS URL for the user's avatar
    profileImage: {
      type: String,
      default: "",
    },

    // Cloudinary unique asset ID for avatar replacement and deletion
    profileImagePublicId: {
      type: String,
      default: "",
    },

    // User-customizable UI preferences
    preferences: {
      defaultSort: {
        type: String,
        enum: ["name-asc", "name-desc", "newest", "oldest"],
        default: "name-asc",
      },
      defaultCategory: {
        type: String,
        default: "All",
      },
      preferredView: {
        type: String,
        enum: ["grid", "table"],
        default: "grid",
      },
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamp fields
    timestamps: true,
  }
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Mongoose Schema:
   Defines the shape, fields, data types, and default values of documents
   within a MongoDB collection. It also applies validation rules before
   data is saved to the database.

2. Mongoose Model:
   A compiled wrapper around the schema that provides an interface to
   query, create, update, and delete documents in MongoDB (e.g. User.find()).

3. Unique Index (`unique: true`):
   Tells MongoDB to create an index that prevents duplicate email records,
   ensuring that no two accounts can register with the same email address.

4. Timestamps Option (`timestamps: true`):
   Instructs Mongoose to automatically create and update `createdAt`
   and `updatedAt` ISO date fields on every document.

5. Embedded Sub-documents / Preference Objects:
   Storing user preferences (such as defaultSort, preferredView) directly
   inside the user document avoids unnecessary table joins or multi-collection
   lookups, keeping queries fast and efficient.
==================================================
*/
