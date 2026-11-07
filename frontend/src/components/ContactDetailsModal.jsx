/**
 * ==============================================================================
 * Contact Details Modal Component
 * ==============================================================================
 * Full-screen / centered modal providing an in-depth view of a selected contact.
 * Includes functional quick-action buttons:
 * - Native phone dialing (`tel:<phone>`)
 * - Native email messaging (`mailto:<email>`)
 * - Live Google Meet video calling (`https://meet.google.com/new`)
 * - Favorite status toggling
 * - Edit and Delete actions
 * ==============================================================================
 */

import {
  X,
  Phone,
  Mail,
  Video,
  Star,
  Edit2,
  Trash2,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";

function ContactDetailsModal({
  isOpen,
  onClose,
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  if (!isOpen || !contact) return null;

  // Format creation and update timestamps for human-friendly display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Generate fallback initials for avatar
  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Video call action: Opens Google Meet meeting creator in a new tab
  const handleVideoCall = () => {
    window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container contact-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="details-header">
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close contact details modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Banner */}
        <div className="details-hero">
          <div className="details-avatar-wrap">
            {contact.profileImage ? (
              <img
                src={contact.profileImage}
                alt={contact.name}
                className="details-avatar-img"
              />
            ) : (
              <div className="details-avatar-initials">
                {getInitials(contact.name)}
              </div>
            )}

            {/* Favorite Star Badge */}
            <button
              type="button"
              className={`details-star-btn ${contact.isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(contact._id)}
              title={contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star size={16} fill={contact.isFavorite ? "#fbbf24" : "none"} />
            </button>
          </div>

          <h2 className="details-name">{contact.name}</h2>

          {(contact.designation || contact.company) && (
            <p className="details-role">
              {contact.designation && <span>{contact.designation}</span>}
              {contact.designation && contact.company && <span> at </span>}
              {contact.company && <strong>{contact.company}</strong>}
            </p>
          )}

          <div className="details-badges">
            <span className={`category-badge ${contact.category?.toLowerCase() || "others"}`}>
              {contact.category || "Others"}
            </span>

            {contact.isFavorite && (
              <span className="badge-favorite">
                <Star size={12} fill="#fbbf24" />
                <span>Favorite</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Functional Action Buttons */}
        <div className="quick-actions-bar">
          {/* 1. Phone Call Action (Native Device Dialer) */}
          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="quick-action-btn action-call"
              title={`Call ${contact.phone}`}
            >
              <div className="action-icon-circle">
                <Phone size={17} />
              </div>
              <span>Call</span>
            </a>
          ) : (
            <button
              type="button"
              className="quick-action-btn disabled"
              disabled
              title="No phone number provided"
            >
              <div className="action-icon-circle">
                <Phone size={17} />
              </div>
              <span>Call</span>
            </button>
          )}

          {/* 2. Email Action (Native Mail Client) */}
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="quick-action-btn action-email"
              title={`Send email to ${contact.email}`}
            >
              <div className="action-icon-circle">
                <Mail size={17} />
              </div>
              <span>Email</span>
            </a>
          ) : (
            <button
              type="button"
              className="quick-action-btn disabled"
              disabled
              title="No email provided"
            >
              <div className="action-icon-circle">
                <Mail size={17} />
              </div>
              <span>Email</span>
            </button>
          )}

          {/* 3. Video Call Action (Opens Google Meet) */}
          <button
            type="button"
            className="quick-action-btn action-video"
            onClick={handleVideoCall}
            title="Start a Video Meeting via Google Meet"
          >
            <div className="action-icon-circle">
              <Video size={17} />
            </div>
            <span>Video Call</span>
          </button>
        </div>

        {/* Detailed Information Grid */}
        <div className="details-info-section">
          <div className="info-grid">
            {/* Primary Phone */}
            <div className="info-item">
              <div className="info-icon">
                <Phone size={16} />
              </div>
              <div className="info-content">
                <label>Primary Phone</label>
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="info-value link">
                    {contact.phone}
                  </a>
                ) : (
                  <span className="info-value muted">Not specified</span>
                )}
              </div>
            </div>

            {/* Secondary Phone */}
            <div className="info-item">
              <div className="info-icon">
                <Phone size={16} />
              </div>
              <div className="info-content">
                <label>Secondary Phone</label>
                {contact.secondaryPhone ? (
                  <a href={`tel:${contact.secondaryPhone}`} className="info-value link">
                    {contact.secondaryPhone}
                  </a>
                ) : (
                  <span className="info-value muted">Not specified</span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="info-item">
              <div className="info-icon">
                <Mail size={16} />
              </div>
              <div className="info-content">
                <label>Email Address</label>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="info-value link">
                    {contact.email}
                  </a>
                ) : (
                  <span className="info-value muted">Not specified</span>
                )}
              </div>
            </div>

            {/* Company & Role */}
            <div className="info-item">
              <div className="info-icon">
                <Briefcase size={16} />
              </div>
              <div className="info-content">
                <label>Company & Role</label>
                <span className="info-value">
                  {contact.company || contact.designation
                    ? `${contact.designation || "Role"} at ${contact.company || "Company"}`
                    : "Not specified"}
                </span>
              </div>
            </div>

            {/* Physical Address */}
            <div className="info-item full-span">
              <div className="info-icon">
                <MapPin size={16} />
              </div>
              <div className="info-content">
                <label>Address / Location</label>
                <span className="info-value">
                  {contact.address || "Not specified"}
                </span>
              </div>
            </div>

            {/* Notes & Comments */}
            <div className="info-item full-span">
              <div className="info-icon">
                <FileText size={16} />
              </div>
              <div className="info-content">
                <label>Notes & Reminders</label>
                <p className="info-notes">
                  {contact.notes || "No additional notes recorded for this contact."}
                </p>
              </div>
            </div>

            {/* Metadata (Created / Updated) */}
            <div className="info-item full-span meta-row">
              <div className="info-icon">
                <Calendar size={15} />
              </div>
              <div className="info-content meta-text">
                <span>Added on {formatDate(contact.createdAt)}</span>
                <span>•</span>
                <span>Last updated {formatDate(contact.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="details-footer">
          <button
            type="button"
            className="btn-details-delete"
            onClick={() => {
              onClose();
              onDelete(contact);
            }}
          >
            <Trash2 size={15} />
            <span>Delete Contact</span>
          </button>

          <button
            type="button"
            className="btn-details-edit"
            onClick={() => {
              onClose();
              onEdit(contact);
            }}
          >
            <Edit2 size={15} />
            <span>Edit Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactDetailsModal;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Standard URI Schemes (tel: & mailto:):
   - `href="tel:+91..."`: Triggers the operating system's native phone
     dialer on smartphones, macOS FaceTime, or Windows Phone Link.
   - `href="mailto:..."`: Automatically launches the default desktop or
     mobile email client (Apple Mail, Outlook, Gmail).

2. External Link Security:
   `window.open("...", "_blank", "noopener,noreferrer")` prevents reverse
   tabnabbing security vulnerabilities by decoupling window.opener.

3. Modal Composition & Action Delegation:
   Clicking "Edit" or "Delete" from inside the details modal cleanly closes
   the details view and delegates to the parent component's respective handlers.

4. Dynamic Semantic Color Coding:
   Coloring categories and active star toggles based on contact state
   creates an intuitive visual hierarchy.
==================================================
*/
