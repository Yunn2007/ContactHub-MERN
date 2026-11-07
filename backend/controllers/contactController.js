/**
 * ==============================================================================
 * Contact Controller
 * ==============================================================================
 * Handles all business logic for Contact operations: Create, Read, Update,
 * Delete (CRUD), searching, alphabetical filtering, category organization,
 * favorite toggles, Cloudinary asset syncing, and dashboard statistics.
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Every single database operation strictly filters by `user: req.user._id`.
 * This prevents IDOR (Insecure Direct Object Reference) vulnerabilities,
 * guaranteeing that no user can access, modify, or delete another user's data.
 * ==============================================================================
 */

import Contact from "../models/Contact.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * GET /api/contacts
 * Retrieve all contacts belonging to the authenticated user.
 * Supports query parameters for search, alphabetical navigation, category filtering, and sorting.
 */
export const getContacts = async (req, res) => {
  try {
    const { search, letter, category, favorite, sort } = req.query;

    // Start with the mandatory owner filter
    const query = { user: req.user._id };

    // Search filter across name, email, phone, and company
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
        { designation: searchRegex },
      ];
    }

    // Alphabetical filter (contacts starting with a specific letter)
    if (letter && letter.trim() && letter.toUpperCase() !== "ALL") {
      const trimmedLetter = letter.trim().charAt(0);
      query.name = new RegExp(`^${trimmedLetter}`, "i");
    }

    // Category filter (Work, Family, Friends, Others)
    if (category && category.trim() && category !== "All") {
      query.category = category.trim();
    }

    // Favorite status filter
    if (favorite === "true") {
      query.isFavorite = true;
    }

    // Sorting strategy
    let sortOption = { name: 1 }; // Default: Alphabetical A-Z

    switch (sort) {
      case "name-desc":
        sortOption = { name: -1 }; // Z-A
        break;
      case "newest":
        sortOption = { createdAt: -1 }; // Most recently added first
        break;
      case "oldest":
        sortOption = { createdAt: 1 }; // Oldest first
        break;
      case "name-asc":
      default:
        sortOption = { name: 1 }; // A-Z
        break;
    }

    // Execute query in MongoDB with case-insensitive collation for accurate alphabetical sorting
    const contacts = await Contact.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contacts.",
      error: error.message,
    });
  }
};

/**
 * GET /api/contacts/:id
 * Retrieve a single contact by ID, ensuring it belongs to the logged-in user.
 */
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id, // Ownership check
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Error fetching contact details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contact details.",
      error: error.message,
    });
  }
};

/**
 * POST /api/contacts
 * Create a new contact. Supports multipart/form-data for image upload to Cloudinary.
 */
export const createContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      secondaryPhone,
      company,
      designation,
      category,
      address,
      notes,
      isFavorite,
    } = req.body;

    // Validate that contact name is provided
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact full name is required.",
      });
    }

    let profileImage = "";
    let profileImagePublicId = "";

    // If an image file was uploaded via Multer, upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "contact-hub/contacts"
        );
        profileImage = uploadResult.secure_url;
        profileImagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.warn("Cloudinary upload failed:", uploadError.message);
        // Continue creating the contact even if image upload encountered an error
      }
    }

    // Create the contact document in MongoDB Atlas
    const newContact = await Contact.create({
      user: req.user._id, // Assign ownership to the authenticated user
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone ? phone.trim() : "",
      secondaryPhone: secondaryPhone ? secondaryPhone.trim() : "",
      company: company ? company.trim() : "",
      designation: designation ? designation.trim() : "",
      category: category || "Others",
      address: address ? address.trim() : "",
      notes: notes ? notes.trim() : "",
      profileImage,
      profileImagePublicId,
      isFavorite: isFavorite === true || isFavorite === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Contact created successfully!",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating contact.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/contacts/:id
 * Update an existing contact's details and/or replace or remove their Cloudinary image.
 */
export const updateContact = async (req, res) => {
  try {
    // Locate the contact and confirm the current user owns it
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id, // Ownership guarantee
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found or you do not have permission to edit it.",
      });
    }

    const {
      name,
      email,
      phone,
      secondaryPhone,
      company,
      designation,
      category,
      address,
      notes,
      isFavorite,
      removeImage,
    } = req.body;

    // Update text fields if provided
    if (name && name.trim()) contact.name = name.trim();
    if (email !== undefined) contact.email = email.trim().toLowerCase();
    if (phone !== undefined) contact.phone = phone.trim();
    if (secondaryPhone !== undefined) contact.secondaryPhone = secondaryPhone.trim();
    if (company !== undefined) contact.company = company.trim();
    if (designation !== undefined) contact.designation = designation.trim();
    if (category !== undefined) contact.category = category;
    if (address !== undefined) contact.address = address.trim();
    if (notes !== undefined) contact.notes = notes.trim();
    if (isFavorite !== undefined) {
      contact.isFavorite = isFavorite === true || isFavorite === "true";
    }

    // Case 1: User uploaded a new image to replace the old one
    if (req.file) {
      // Remove old image from Cloudinary to free space
      if (contact.profileImagePublicId) {
        await deleteFromCloudinary(contact.profileImagePublicId);
      }

      // Upload new replacement image
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "contact-hub/contacts"
        );
        contact.profileImage = uploadResult.secure_url;
        contact.profileImagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.warn("Cloudinary replacement upload failed:", uploadError.message);
      }
    }
    // Case 2: User requested to remove the current image
    else if (removeImage === "true" || removeImage === true) {
      if (contact.profileImagePublicId) {
        await deleteFromCloudinary(contact.profileImagePublicId);
      }
      contact.profileImage = "";
      contact.profileImagePublicId = "";
    }

    // Save changes to MongoDB Atlas
    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully!",
      contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating contact.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/contacts/:id
 * Permanently delete a contact and purge their associated Cloudinary image.
 */
export const deleteContact = async (req, res) => {
  try {
    // Find contact owned by this user
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id, // Enforce ownership
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found or you do not have permission to delete it.",
      });
    }

    // Delete image from Cloudinary if one exists
    if (contact.profileImagePublicId) {
      await deleteFromCloudinary(contact.profileImagePublicId);
    }

    // Remove document from MongoDB
    await Contact.deleteOne({ _id: contact._id });

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting contact.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/contacts/:id/favorite
 * Quick action to toggle favorite status on or off.
 */
export const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id, // Enforce ownership
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    // Toggle the boolean state
    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: contact.isFavorite
        ? "Contact added to favorites."
        : "Contact removed from favorites.",
      contact,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating favorite status.",
      error: error.message,
    });
  }
};

/**
 * GET /api/contacts/stats
 * Aggregate dynamic statistics for the authenticated user's dashboard.
 * Calculates total contacts, favorites, active categories, category distribution,
 * and recently added contacts without any hardcoded values.
 */
export const getContactStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Total contacts count for this user
    const totalContacts = await Contact.countDocuments({ user: userId });

    // 2. Favorites count for this user
    const totalFavorites = await Contact.countDocuments({
      user: userId,
      isFavorite: true,
    });

    // 3. Category distribution counts
    const workCount = await Contact.countDocuments({
      user: userId,
      category: "Work",
    });
    const familyCount = await Contact.countDocuments({
      user: userId,
      category: "Family",
    });
    const friendsCount = await Contact.countDocuments({
      user: userId,
      category: "Friends",
    });
    const othersCount = await Contact.countDocuments({
      user: userId,
      category: "Others",
    });

    const categoryDistribution = {
      Work: workCount,
      Family: familyCount,
      Friends: friendsCount,
      Others: othersCount,
    };

    // Calculate how many categories currently contain at least 1 contact
    const activeCategoriesCount = Object.values(categoryDistribution).filter(
      (count) => count > 0
    ).length;

    // 4. Recently added contacts (contacts added in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyAddedCount = await Contact.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // 5. Top 5 most recent contacts for the dashboard preview
    const recentContacts = await Contact.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalContacts,
        totalFavorites,
        activeCategoriesCount,
        recentlyAddedCount,
        categoryDistribution,
        recentContacts,
      },
    });
  } catch (error) {
    console.error("Error calculating contact statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics.",
      error: error.message,
    });
  }
};

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Multi-Tenant Authorization Enforcement:
   Every single query includes `{ user: req.user._id }`. Even if an
   attacker crafts a request with another user's contact ID, MongoDB
   finds zero matches and returns 404, preventing unauthorized access.

2. MongoDB Query Operators ($or, $regex, $gte):
   - $or: Evaluates whether any condition in an array matches.
   - $regex: Case-insensitive regular expression matching for live search
     and alphabetical starting letter filters (^A).
   - $gte: Greater-than-or-equal operator for date range calculations.

3. Sorting Strategies (Mongoose .sort()):
   - { name: 1 }: Ascending alphabetical order (A-Z).
   - { name: -1 }: Descending alphabetical order (Z-A).
   - { createdAt: -1 }: Newest records first by creation timestamp.

4. Cloudinary Lifecycle Management:
   When updating or deleting a contact with an existing avatar, the old
   Cloudinary asset is actively destroyed using `deleteFromCloudinary(publicId)`
   to prevent zombie files from eating cloud storage limits.

5. Dynamic Aggregation & countDocuments:
   Instead of hardcoding dashboard cards, `Contact.countDocuments` performs
   ultra-fast indexed counting in MongoDB to power real-time analytics.
==================================================
*/

