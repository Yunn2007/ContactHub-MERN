/**
 * ==============================================================================
 * Categories Page Component
 * ==============================================================================
 * Dedicated category manager for organizing and filtering contacts by group:
 * - Work
 * - Family
 * - Friends
 * - Others
 * Allows seamless switching between category tabs, viewing contact distributions,
 * and creating contacts directly into the selected category.
 * ==============================================================================
 */

import { useState, useEffect } from "react";
import {
  Briefcase,
  Heart,
  Users2,
  Tag,
  UserPlus,
  Star,
  Phone,
  Mail,
  Video,
  Eye,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import ContactFormModal from "../components/ContactFormModal";
import ContactDetailsModal from "../components/ContactDetailsModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import { useContacts } from "../context/useContacts";

const CATEGORIES = [
  { id: "Work", label: "Work", icon: Briefcase, color: "blue", desc: "Colleagues, clients, and professional connections" },
  { id: "Family", label: "Family", icon: Heart, color: "purple", desc: "Parents, siblings, and extended family members" },
  { id: "Friends", label: "Friends", icon: Users2, color: "green", desc: "Close friends and social network" },
  { id: "Others", label: "Others", icon: Tag, color: "amber", desc: "Services, general acquaintances, and others" },
];

function Categories() {
  const {
    contacts,
    stats,
    loading,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
  } = useContacts();

  const [activeCategory, setActiveCategory] = useState("Work");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  // Fetch contacts for the selected category tab
  useEffect(() => {
    fetchContacts({
      category: activeCategory,
      letter: "ALL",
      search: "",
      favorite: undefined,
      sort: "name-asc",
    });
  }, [activeCategory, fetchContacts]);

  // Initials helper
  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Video call
  const handleVideoCall = (e) => {
    e.stopPropagation();
    window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
  };

  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="contacts-page-header">
        <div>
          <h1 className="page-title">Contact Categories</h1>
          <p className="page-subtitle">
            Group and organize your connections by relationship type.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add to {activeCategory}</span>
        </button>
      </div>

      {/* Category Selection Tabs / Cards */}
      <div className="category-tabs-grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = stats.categoryDistribution?.[cat.id] || 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`category-tab-card ${cat.color} ${isActive ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="tab-card-top">
                <div className={`tab-icon-box ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <span className="tab-contact-count">{count}</span>
              </div>

              <div className="tab-card-info">
                <strong>{cat.label}</strong>
                <p>{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Category Header */}
      <div className="active-category-banner">
        <div>
          <h2>
            {activeCategory} Contacts{" "}
            <span className="banner-count-badge">
              {contacts.length} {contacts.length === 1 ? "person" : "people"}
            </span>
          </h2>
          <p>{activeCategoryMeta?.desc}</p>
        </div>
      </div>

      {/* Contacts in Active Category */}
      {loading ? (
        <div className="contacts-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading {activeCategory} contacts...</p>
        </div>
      ) : contacts.length > 0 ? (
        <div className="contacts-card-grid">
          {contacts.map((contact) => (
            <div key={contact._id} className="contact-card">
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

                {/* Star Toggle */}
                <button
                  type="button"
                  className={`star-toggle-btn ${contact.isFavorite ? "active" : ""}`}
                  onClick={() => toggleFavorite(contact._id)}
                  title={
                    contact.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={16}
                    fill={contact.isFavorite ? "#fbbf24" : "none"}
                  />
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

              {/* Direct Links */}
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
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={handleVideoCall}
                  title="Start Google Meet Video Call"
                >
                  <Video size={14} />
                </button>

                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => setSelectedContact(contact)}
                  title="View Contact Details"
                >
                  <Eye size={14} />
                </button>

                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => setEditingContact(contact)}
                  title="Edit Contact"
                >
                  <Edit2 size={14} />
                </button>

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
          <div className="empty-state-icon-box blue">
            <Users size={40} />
          </div>
          <h3>No {activeCategory} contacts yet</h3>
          <p>
            You haven't categorized any contacts under "{activeCategory}".
            Click below to add a new contact directly to this category.
          </p>

          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Add Contact to {activeCategory}</span>
          </button>
        </div>
      )}

      {/* Add Modal with pre-selected category */}
      <ContactFormModal
        isOpen={isAddModalOpen}
        initialData={{ category: activeCategory }}
        onClose={() => setIsAddModalOpen(false)}
        onSave={createContact}
      />

      {/* Edit Modal */}
      <ContactFormModal
        isOpen={Boolean(editingContact)}
        initialData={editingContact}
        onClose={() => setEditingContact(null)}
        onSave={(data) => updateContact(editingContact._id, data)}
      />

      {/* Details Modal */}
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

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingContact)}
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={deleteContact}
      />
    </DashboardLayout>
  );
}

export default Categories;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Tabbed State Routing & Categorical Filtering:
   Maintains an active category tab in React state (`activeCategory`),
   querying the backend to show only contacts matching that category.

2. Pre-populated Creation Context:
   Passing `{ category: activeCategory }` into `<ContactFormModal>` automatically
   defaults the category dropdown to the currently active tab.

3. Live Aggregate Badge Synchronization:
   Pulls live category counts from `stats.categoryDistribution` so that
   each category card displays its current accurate population.
==================================================
*/
