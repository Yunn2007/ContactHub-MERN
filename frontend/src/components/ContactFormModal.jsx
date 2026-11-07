/**
 * ==============================================================================
 * Contact Form Modal Component (Add & Edit)
 * ==============================================================================
 * Reusable modal dialog for creating a new contact or editing an existing contact.
 * Includes:
 * - Profile image file picker with instant local blob preview
 * - Remove image capability
 * - Inputs for name, email, phones, company, designation, category, address, notes
 * - Client-side validation and responsive dark-theme design
 * - FormData packaging for Multer & Cloudinary processing
 * ==============================================================================
 */

import { useState, useRef } from "react";
import {
  X,
  Upload,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  Star,
  Loader2,
} from "lucide-react";

/**
 * Inner form content component.
 * By keying this component with initialData?._id || "new", React mounts a fresh
 * instance with properly initialized state whenever the contact changes,
 * avoiding cascading re-renders.
 */
function ContactFormContent({ onClose, onSave, initialData }) {
  const isEditMode = Boolean(initialData && initialData._id);

  // Initialize form field state from initialData
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    secondaryPhone: initialData?.secondaryPhone || "",
    company: initialData?.company || "",
    designation: initialData?.designation || "",
    category: initialData?.category || "Work",
    address: initialData?.address || "",
    notes: initialData?.notes || "",
    isFavorite: Boolean(initialData?.isFavorite),
  }));

  // Image upload and preview states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.profileImage || ""
  );
  const [removeImage, setRemoveImage] = useState(false);

  // Status & error states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorMessage("");
  };

  // Handle local image file selection from file input
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Selected image is too large. Maximum size is 5MB.");
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  // Remove the currently displayed picture
  const handleRemovePicture = () => {
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("secondaryPhone", formData.secondaryPhone.trim());
      data.append("company", formData.company.trim());
      data.append("designation", formData.designation.trim());
      data.append("category", formData.category);
      data.append("address", formData.address.trim());
      data.append("notes", formData.notes.trim());
      data.append("isFavorite", formData.isFavorite);

      if (imageFile) {
        data.append("image", imageFile);
      } else if (removeImage) {
        data.append("removeImage", "true");
      }

      const result = await onSave(data);

      if (result && result.success === false) {
        setErrorMessage(result.message || "Failed to save contact.");
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setErrorMessage("An error occurred while saving the contact.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-container contact-form-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="modal-header">
        <div className="modal-title-wrap">
          <div className="modal-title-icon">
            <User size={20} />
          </div>
          <div>
            <h3>{isEditMode ? "Edit Contact" : "Add New Contact"}</h3>
            <p>
              {isEditMode
                ? "Update your contact's profile and details."
                : "Fill in the details to add a new person to Contact Hub."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="contact-form">
        {/* Avatar / Photo Upload Row */}
        <div className="form-avatar-section">
          <div className="avatar-preview-box">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Contact preview"
                className="avatar-preview-img"
              />
            ) : (
              <div className="avatar-placeholder">
                <User size={32} />
              </div>
            )}
          </div>

          <div className="avatar-actions">
            <span className="avatar-actions-label">Contact Photo</span>
            <p className="avatar-actions-help">
              Upload a JPEG, PNG, or WEBP photo (max 5MB).
            </p>

            <div className="avatar-buttons">
              <button
                type="button"
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
              </button>

              {imagePreview && (
                <button
                  type="button"
                  className="btn-remove-photo"
                  onClick={handleRemovePicture}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="form-error-banner" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Grid */}
        <div className="form-grid">
          {/* Full Name (Required) */}
          <div className="form-field full-width">
            <label htmlFor="contact-name">
              Full Name <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="contact-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-field">
            <label htmlFor="contact-category">Category</label>
            <select
              id="contact-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="category-select"
            >
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Primary Phone */}
          <div className="form-field">
            <label htmlFor="contact-phone">Primary Phone</label>
            <div className="input-with-icon">
              <Phone size={16} className="field-icon" />
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Secondary Phone */}
          <div className="form-field">
            <label htmlFor="contact-secondary-phone">Secondary Phone</label>
            <div className="input-with-icon">
              <Phone size={16} className="field-icon" />
              <input
                id="contact-secondary-phone"
                type="tel"
                name="secondaryPhone"
                placeholder="+91 91234 56789 (optional)"
                value={formData.secondaryPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company */}
          <div className="form-field">
            <label htmlFor="contact-company">Company / Organization</label>
            <div className="input-with-icon">
              <Briefcase size={16} className="field-icon" />
              <input
                id="contact-company"
                type="text"
                name="company"
                placeholder="e.g. Google, TechCorp"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Designation / Role */}
          <div className="form-field">
            <label htmlFor="contact-designation">Designation / Role</label>
            <input
              id="contact-designation"
              type="text"
              name="designation"
              placeholder="e.g. Senior Software Engineer"
              value={formData.designation}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="form-field full-width">
            <label htmlFor="contact-address">Address / Location</label>
            <div className="input-with-icon">
              <MapPin size={16} className="field-icon" />
              <input
                id="contact-address"
                type="text"
                name="address"
                placeholder="e.g. 42 Tech Park, Bengaluru, India"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-field full-width">
            <label htmlFor="contact-notes">Notes & Reminders</label>
            <div className="textarea-with-icon">
              <FileText size={16} className="field-icon textarea-icon" />
              <textarea
                id="contact-notes"
                name="notes"
                rows={3}
                placeholder="Additional context, meeting notes, or relationship reminders..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Favorite Status Toggle */}
          <div className="form-field full-width favorite-toggle-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleChange}
              />
              <span className="checkbox-custom">
                <Star size={14} className={formData.isFavorite ? "active" : ""} />
              </span>
              <span className="checkbox-text">
                Mark as Favorite (starred contacts appear on your Favorites page)
              </span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-modal-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditMode ? "Save Changes" : "Create Contact"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ContactFormModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <ContactFormContent
        key={initialData?._id || "new-contact"}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}

export default ContactFormModal;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Component Reset via Keys Pattern:
   Using `key={initialData?._id || "new-contact"}` forces React to mount a
   fresh `<ContactFormContent>` with initialized state whenever switching
   between different contacts, avoiding cascading render loops in useEffect.

2. Browser Blob Preview (`URL.createObjectURL`):
   Generates an ephemeral in-memory URL for immediate client-side
   image preview before the file is uploaded to Cloudinary.

3. HTML5 FormData Interface:
   Bundles binary image files (`image`) and form text fields together into
   a standard multipart/form-data payload for the backend.

4. Event Propagation Control (`e.stopPropagation()`):
   Prevents clicks inside the modal card from bubbling to the background overlay.
==================================================
*/
