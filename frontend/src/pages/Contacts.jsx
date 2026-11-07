/**
 * ==============================================================================
 * All Contacts Page Component
 * ==============================================================================
 * Main directory for browsing, searching, sorting, and managing all contacts.
 * Features:
 * - Dynamic live search across name, email, phone, and company
 * - Direct sorting: A to Z, Z to A, Recently Added, Oldest First
 * - Category filter (Work, Family, Friends, Others, All)
 * - Favorites-only toggle filter
 * - View mode toggle: Responsive Card Grid vs Scannable Table
 * - Complete CRUD actions: Add, View Details, Edit, Delete, Toggle Favorite
 * ==============================================================================
 */

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  UserPlus,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Star,
  Phone,
  Mail,
  Video,
  Eye,
  Edit2,
  Trash2,
  X,
  Users,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import ContactFormModal from "../components/ContactFormModal";
import ContactDetailsModal from "../components/ContactDetailsModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import { useContacts } from "../context/useContacts";

function Contacts() {
  const {
    contacts,
    loading,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
  } = useContacts();

  // Local state for modal management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Trigger contacts fetch whenever filters, sorting, or category change
  useEffect(() => {
    fetchContacts({
      search: searchQuery,
      category: selectedCategory,
      sort: sortOption,
      favorite: onlyFavorites ? "true" : undefined,
    });
  }, [searchQuery, selectedCategory, sortOption, onlyFavorites, fetchContacts]);

  // Client-side sorting guarantee: instant, accurate sorting across cards & table
  const sortedContacts = useMemo(() => {
    const list = [...contacts];

    switch (sortOption) {
      case "name-desc":
        // Z to A (case-insensitive)
        return list.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );

      case "newest":
        // Most recently added first
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

      case "oldest":
        // Oldest first
        return list.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

      case "name-asc":
      default:
        // A to Z (case-insensitive)
        return list.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );
    }
  }, [contacts, sortOption]);

  // Compute initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Quick video call helper (Google Meet)
  const handleVideoCall = (e) => {
    e.stopPropagation();
    window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="contacts-page-header">
        <div>
          <h1 className="page-title">All Contacts</h1>
          <p className="page-subtitle">
            Manage, organize, and search through all your stored connections.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search and Control Toolbar */}
      <div className="contacts-toolbar">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, phone, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and View Controls */}
        <div className="toolbar-controls">
          {/* Category Dropdown Filter */}
          <div className="toolbar-select-group">
            <Filter size={16} className="control-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="toolbar-select"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Sort Dropdown: A-Z, Z-A, Newest, Oldest */}
          <div className="toolbar-select-group">
            <ArrowUpDown size={16} className="control-icon" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="toolbar-select"
            >
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Only Favorites Toggle Button */}
          <button
            type="button"
            className={`btn-toolbar-toggle ${onlyFavorites ? "active" : ""}`}
            onClick={() => setOnlyFavorites((prev) => !prev)}
            title="Filter by favorites"
          >
            <Star size={16} fill={onlyFavorites ? "#fbbf24" : "none"} />
            <span>Favorites</span>
          </button>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid Card View"
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
              aria-label="Table view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="results-summary-bar">
        <span>
          Showing <strong>{sortedContacts.length}</strong>{" "}
          {sortedContacts.length === 1 ? "contact" : "contacts"}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {onlyFavorites && " (Favorites only)"}
          {sortOption === "name-asc" && " • Sorted A to Z"}
          {sortOption === "name-desc" && " • Sorted Z to A"}
          {sortOption === "newest" && " • Sorted: Recently Added"}
          {sortOption === "oldest" && " • Sorted: Oldest First"}
        </span>

        {(selectedCategory !== "All" ||
          searchQuery ||
          onlyFavorites ||
          sortOption !== "name-asc") && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
              setOnlyFavorites(false);
              setSortOption("name-asc");
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Contact Content Display */}
      {loading ? (
        <div className="contacts-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your contacts...</p>
        </div>
      ) : sortedContacts.length > 0 ? (
        viewMode === "grid" ? (
          /* ========================================================= */
          /* GRID VIEW: Clean Responsive Contact Cards                 */
          /* ========================================================= */
          <div className="contacts-card-grid">
            {sortedContacts.map((contact) => (
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

                  {/* Favorite Star Button */}
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

                {/* Direct Contact Links */}
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
                  {/* Video call button */}
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
          /* ========================================================= */
          /* TABLE VIEW: Dense, Scannable Table Layout                 */
          /* ========================================================= */
          <div className="contacts-table-wrapper">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th className="th-star"></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company / Role</th>
                  <th>Category</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((contact) => (
                  <tr key={contact._id} className="table-row">
                    {/* Star */}
                    <td className="td-star">
                      <button
                        type="button"
                        className={`star-toggle-btn ${contact.isFavorite ? "active" : ""}`}
                        onClick={() => toggleFavorite(contact._id)}
                      >
                        <Star
                          size={15}
                          fill={contact.isFavorite ? "#fbbf24" : "none"}
                        />
                      </button>
                    </td>

                    {/* Name & Avatar */}
                    <td
                      className="td-name"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="table-user-wrap">
                        {contact.profileImage ? (
                          <img
                            src={contact.profileImage}
                            alt={contact.name}
                            className="table-avatar-img"
                          />
                        ) : (
                          <div className="table-avatar-initials">
                            {getInitials(contact.name)}
                          </div>
                        )}
                        <strong>{contact.name}</strong>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="td-email">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="table-link"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="td-phone">
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="table-link">
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>

                    {/* Company / Designation */}
                    <td className="td-company">
                      {contact.company || contact.designation ? (
                        <span>
                          {contact.designation || ""}
                          {contact.designation && contact.company ? " at " : ""}
                          <strong>{contact.company || ""}</strong>
                        </span>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="td-category">
                      <span
                        className={`category-badge ${contact.category?.toLowerCase() || "others"}`}
                      >
                        {contact.category || "Others"}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="td-actions">
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="table-action-icon"
                          onClick={() => setSelectedContact(contact)}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="table-action-icon"
                          onClick={() => setEditingContact(contact)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="table-action-icon danger"
                          onClick={() => setDeletingContact(contact)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="contacts-empty-state">
          <div className="empty-state-icon-box">
            <Users size={40} />
          </div>
          <h3>No contacts found</h3>
          <p>
            {searchQuery || selectedCategory !== "All" || onlyFavorites
              ? "No contacts match your active search or filter criteria. Try resetting your filters."
              : "You haven't added any contacts yet. Get started by adding your first connection!"}
          </p>

          {searchQuery || selectedCategory !== "All" || onlyFavorites ? (
            <button
              type="button"
              className="btn-empty-reset"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setOnlyFavorites(false);
                setSortOption("name-asc");
              }}
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus size={16} />
              <span>Add First Contact</span>
            </button>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      <ContactFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={createContact}
      />

      {/* Edit Contact Modal */}
      <ContactFormModal
        isOpen={Boolean(editingContact)}
        initialData={editingContact}
        onClose={() => setEditingContact(null)}
        onSave={(data) => updateContact(editingContact._id, data)}
      />

      {/* Contact Details Modal */}
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

export default Contacts;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React useMemo Hook for Deterministic Sorting:
   `useMemo` computes the sorted contact list whenever `contacts` or `sortOption`
   changes, guaranteeing instant, responsive sorting across both Grid and Table
   views without unnecessary re-renders.

2. String localeCompare with Natural Case Sensitivity:
   `(a.name).localeCompare(b.name, undefined, { sensitivity: 'base' })`
   ensures alphabetical order is case-insensitive so names like "aarav" and "Aarav"
   sort correctly together.

3. Adaptive View Presentation (Grid vs Table):
   Enables users to toggle between rich responsive card grids and
   compact data tables while preserving active search, category, and sorting state.

4. Direct Communication Protocols:
   Uses standard URI schemes (`tel:`, `mailto:`) and Google Meet meeting
   creator shortcuts to provide immediate functional actions.
==================================================
*/
