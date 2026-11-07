/**
 * ==============================================================================
 * Favorites Page Component
 * ==============================================================================
 * Dedicated view showcasing the user's starred / bookmarked favorite contacts.
 * Features:
 * - Real-time filtering strictly to contacts with `isFavorite: true`
 * - Search within favorites
 * - Sort options (A-Z, Z-A, Newest, Oldest)
 * - Click-to-call, click-to-email, and Google Meet video calling
 * - Seamless favorite removal with instant global sync
 * - Empty state with friendly prompt to star contacts
 * ==============================================================================
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Search,
  Phone,
  Mail,
  Video,
  Eye,
  Edit2,
  Trash2,
  X,
  Users,
  ArrowRight,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import ContactFormModal from "../components/ContactFormModal";
import ContactDetailsModal from "../components/ContactDetailsModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import { useContacts } from "../context/useContacts";

function Favorites() {
  const {
    contacts,
    loading,
    fetchContacts,
    updateContact,
    deleteContact,
    toggleFavorite,
  } = useContacts();

  // Search query within favorites
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [favoriteSort, setFavoriteSort] = useState("name-asc");

  // Modal states
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  // Load contacts with favorite filter enabled
  useEffect(() => {
    fetchContacts({
      favorite: "true",
      search: favoriteSearch,
      sort: favoriteSort,
      letter: "ALL",
      category: "All",
    });
  }, [favoriteSearch, favoriteSort, fetchContacts]);

  // Client-side sorting guarantee for favorites (A-Z, Z-A, Newest, Oldest)
  const sortedFavorites = useMemo(() => {
    const list = [...contacts];

    switch (favoriteSort) {
      case "name-desc":
        return list.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );

      case "newest":
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

      case "oldest":
        return list.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

      case "name-asc":
      default:
        return list.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );
    }
  }, [contacts, favoriteSort]);

  // Compute avatar initials
  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Quick video call helper
  const handleVideoCall = (e) => {
    e.stopPropagation();
    window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="contacts-page-header">
        <div>
          <div className="favorites-header-title">
            <h1 className="page-title">Favorite Contacts</h1>
            <span className="favorites-count-pill">
              <Star size={13} fill="#fbbf24" />
              <span>{sortedFavorites.length} Starred</span>
            </span>
          </div>
          <p className="page-subtitle">
            Quickly access and connect with your most important contacts.
          </p>
        </div>

        <Link to="/contacts" className="btn-secondary-action">
          <Users size={16} />
          <span>Browse All Contacts</span>
        </Link>
      </div>

      {/* Favorites Toolbar */}
      <div className="contacts-toolbar">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search within your favorite contacts..."
            value={favoriteSearch}
            onChange={(e) => setFavoriteSearch(e.target.value)}
          />
          {favoriteSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setFavoriteSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="toolbar-controls">
          <select
            value={favoriteSort}
            onChange={(e) => setFavoriteSort(e.target.value)}
            className="toolbar-select"
          >
            <option value="name-asc">Sort: A to Z</option>
            <option value="name-desc">Sort: Z to A</option>
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Favorites Content */}
      {loading ? (
        <div className="contacts-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your favorite contacts...</p>
        </div>
      ) : sortedFavorites.length > 0 ? (
        <div className="contacts-card-grid">
          {sortedFavorites.map((contact) => (
            <div key={contact._id} className="contact-card favorite-highlighted">
              <div className="contact-card-top">
                {/* Avatar */}
                <div
                  className="contact-card-avatar"
                  onClick={() => setSelectedContact(contact)}
                >
                  {contact.profileImage ? (
                    <img
                      src={contact.profileImage}
                      alt={contact.name}
                      className="contact-avatar-img"
                    />
                  ) : (
                    <div className="contact-avatar-initials">
                      {getInitials(contact.name)}
                    </div>
                  )}
                </div>

                {/* Star Toggle (Removing from favorites) */}
                <button
                  type="button"
                  className="star-toggle-btn active"
                  onClick={() => toggleFavorite(contact._id)}
                  title="Remove from favorites"
                >
                  <Star size={16} fill="#fbbf24" />
                </button>
              </div>

              {/* Contact Identity */}
              <div
                className="contact-card-info"
                onClick={() => setSelectedContact(contact)}
              >
                <h3 className="card-name">{contact.name}</h3>

                {(contact.designation || contact.company) && (
                  <p className="card-role">
                    {contact.designation && <span>{contact.designation}</span>}
                    {contact.designation && contact.company && <span> • </span>}
                    {contact.company && <span>{contact.company}</span>}
                  </p>
                )}

                <span
                  className={`category-badge ${contact.category?.toLowerCase() || "others"}`}
                >
                  {contact.category || "Others"}
                </span>
              </div>

              {/* Direct Communication Links */}
              <div className="contact-card-links">
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="card-link"
                    title={`Email ${contact.email}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail size={14} />
                    <span className="truncate">{contact.email}</span>
                  </a>
                ) : (
                  <span className="card-link muted">
                    <Mail size={14} />
                    <span>No email</span>
                  </span>
                )}

                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    className="card-link"
                    title={`Call ${contact.phone}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={14} />
                    <span>{contact.phone}</span>
                  </a>
                ) : (
                  <span className="card-link muted">
                    <Phone size={14} />
                    <span>No phone</span>
                  </span>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="contact-card-footer">
                {/* Video call */}
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={handleVideoCall}
                  title="Start Google Meet Video Call"
                >
                  <Video size={14} />
                </button>

                {/* View details */}
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => setSelectedContact(contact)}
                  title="View Contact Details"
                >
                  <Eye size={14} />
                </button>

                {/* Edit contact */}
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => setEditingContact(contact)}
                  title="Edit Contact"
                >
                  <Edit2 size={14} />
                </button>

                {/* Delete contact */}
                <button
                  type="button"
                  className="card-action-btn danger"
                  onClick={() => setDeletingContact(contact)}
                  title="Delete Contact"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="contacts-empty-state">
          <div className="empty-state-icon-box amber">
            <Star size={40} fill="#fbbf24" />
          </div>
          <h3>No favorite contacts yet</h3>
          <p>
            {favoriteSearch
              ? `No favorites match "${favoriteSearch}".`
              : "Star contacts across your directory to have quick one-click access to them right here."}
          </p>

          <Link to="/contacts" className="btn-primary-action">
            <span>Explore All Contacts</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Edit Contact Modal */}
      <ContactFormModal
        isOpen={Boolean(editingContact)}
        initialData={editingContact}
        onClose={() => setEditingContact(null)}
        onSave={(data) => updateContact(editingContact._id, data)}
      />

      {/* View Contact Details Modal */}
      <ContactDetailsModal
        isOpen={Boolean(selectedContact)}
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onEdit={(contact) => {
          setSelectedContact(null);
          setEditingContact(contact);
        }}
        onDelete={(contact) => {
          setSelectedContact(null);
          setDeletingContact(contact);
        }}
        onToggleFavorite={toggleFavorite}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingContact)}
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={deleteContact}
      />
    </DashboardLayout>
  );
}

export default Favorites;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Filtered Sub-Domain Views:
   Applies a specialized query (`favorite: "true"`) to reuse the core
   contact infrastructure while presenting a targeted, purpose-built view.

2. Bidirectional Global State Synchronization:
   Unstarring a contact immediately drops it from the Favorites list and
   updates the dashboard statistics counter without requiring page refreshes.

3. Empty State Guidance:
   Provides clear call-to-action buttons (`Browse All Contacts`) when
   no favorite records exist, preventing dead-ends in user journeys.
==================================================
*/

