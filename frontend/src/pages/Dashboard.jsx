/**
 * ==============================================================================
 * Dashboard Page Component
 * ==============================================================================
 * Main landing overview for authenticated users.
 * Features:
 * - Dynamic, personalized time-based greeting ("Good morning / evening, Name")
 * - 4 Real-time dynamic statistic cards (Total Contacts, Favorites, Categories, Recently Added)
 * - Recent Contacts table/list with quick actions and "View All" shortcut
 * - Category Distribution breakdown across Work, Family, Friends, and Others
 * - Quick Add Contact modal trigger
 * ==============================================================================
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Star,
  FolderKanban,
  Clock,
  UserPlus,
  ArrowRight,
  Phone,
  Mail,
  Eye,
  CheckCircle2,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import ContactFormModal from "../components/ContactFormModal";
import ContactDetailsModal from "../components/ContactDetailsModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import { useAuth } from "../context/useAuth";
import { useContacts } from "../context/useContacts";

function Dashboard() {
  const { user } = useAuth();
  const {
    stats,
    statsLoading,
    fetchStats,
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
  } = useContacts();

  // Modal control states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  // Compute personalized dynamic greeting based on system hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };

  // Extract first name for personalized greeting
  const firstName = user?.name ? user.name.trim().split(" ")[0] : "there";

  // Reload statistics when dashboard mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Compute initials for contact avatar
  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Safe percentage helper for category distribution bars
  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <DashboardLayout>
      {/* Top Banner / Personalized Greeting */}
      <div className="dashboard-header-row">
        <div>
          <span className="dashboard-date-label">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <h1 className="dashboard-greeting">
            {getGreeting()}, <span className="brand-highlight">{firstName}</span>
          </h1>
          <p className="dashboard-subtitle">
            Here's an overview of your contacts and workspace connections.
          </p>
        </div>

        {/* Quick Add Contact Action Button */}
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* 4 Dynamic Statistic Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Contacts */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Contacts</span>
            <div className="stat-icon-box purple">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <strong className="stat-number">
              {statsLoading ? "—" : stats.totalContacts || 0}
            </strong>
            <span className="stat-trend">Stored in your Contact Hub</span>
          </div>
        </div>

        {/* Card 2: Favorites */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Favorites</span>
            <div className="stat-icon-box amber">
              <Star size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <strong className="stat-number">
              {statsLoading ? "—" : stats.totalFavorites || 0}
            </strong>
            <span className="stat-trend">Starred for quick access</span>
          </div>
        </div>

        {/* Card 3: Active Categories */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Categories</span>
            <div className="stat-icon-box blue">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <strong className="stat-number">
              {statsLoading ? "—" : stats.activeCategoriesCount || 0}
            </strong>
            <span className="stat-trend">Active contact groups</span>
          </div>
        </div>

        {/* Card 4: Recently Added */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Recently Added</span>
            <div className="stat-icon-box green">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <strong className="stat-number">
              {statsLoading ? "—" : stats.recentlyAddedCount || 0}
            </strong>
            <span className="stat-trend">Added in the last 30 days</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Contacts & Category Distribution */}
      <div className="dashboard-content-grid">
        {/* Left Column: Recent Contacts */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Contacts</h3>
              <p>The latest people added to your account.</p>
            </div>

            <Link to="/contacts" className="panel-action-link">
              <span>View All</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="panel-body">
            {stats.recentContacts && stats.recentContacts.length > 0 ? (
              <div className="recent-contacts-list">
                {stats.recentContacts.map((contact) => (
                  <div key={contact._id} className="recent-contact-item">
                    {/* Avatar */}
                    <div
                      className="recent-contact-avatar"
                      onClick={() => setSelectedContact(contact)}
                    >
                      {contact.profileImage ? (
                        <img
                          src={contact.profileImage}
                          alt={contact.name}
                          className="contact-avatar-img"
                        />
                      ) : (
                        <span className="contact-avatar-initials">
                          {getInitials(contact.name)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div
                      className="recent-contact-info"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <strong className="contact-name">{contact.name}</strong>
                      <span className="contact-subtext">
                        {contact.designation || contact.company || contact.email || contact.phone || "No details"}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <span
                      className={`category-badge ${contact.category?.toLowerCase() || "others"}`}
                    >
                      {contact.category || "Others"}
                    </span>

                    {/* Favorite Star Toggle */}
                    <button
                      type="button"
                      className={`star-toggle-btn ${contact.isFavorite ? "active" : ""}`}
                      onClick={() => toggleFavorite(contact._id)}
                      title={contact.isFavorite ? "Remove favorite" : "Mark favorite"}
                    >
                      <Star
                        size={16}
                        fill={contact.isFavorite ? "#fbbf24" : "none"}
                      />
                    </button>

                    {/* Quick Action Icons */}
                    <div className="recent-quick-actions">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="icon-action-btn"
                          title={`Call ${contact.phone}`}
                        >
                          <Phone size={15} />
                        </a>
                      )}

                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="icon-action-btn"
                          title={`Email ${contact.email}`}
                        >
                          <Mail size={15} />
                        </a>
                      )}

                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => setSelectedContact(contact)}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-panel-state">
                <Users size={36} className="empty-state-icon" />
                <h4>No contacts yet</h4>
                <p>Start building your address book by adding your first contact.</p>
                <button
                  type="button"
                  className="btn-empty-add"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <UserPlus size={16} />
                  <span>Add First Contact</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Category Breakdown</h3>
              <p>Distribution of contacts across groups.</p>
            </div>

            <Link to="/categories" className="panel-action-link">
              <span>Manage</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="panel-body">
            <div className="category-distribution-list">
              {/* Work */}
              <div className="category-dist-row">
                <div className="dist-row-top">
                  <div className="dist-label-wrap">
                    <span className="dist-color-dot blue"></span>
                    <strong className="dist-name">Work</strong>
                  </div>
                  <span className="dist-count">
                    {stats.categoryDistribution?.Work || 0} contacts (
                    {calculatePercentage(
                      stats.categoryDistribution?.Work,
                      stats.totalContacts
                    )}
                    %)
                  </span>
                </div>
                <div className="dist-progress-track">
                  <div
                    className="dist-progress-fill blue"
                    style={{
                      width: `${calculatePercentage(
                        stats.categoryDistribution?.Work,
                        stats.totalContacts
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Family */}
              <div className="category-dist-row">
                <div className="dist-row-top">
                  <div className="dist-label-wrap">
                    <span className="dist-color-dot purple"></span>
                    <strong className="dist-name">Family</strong>
                  </div>
                  <span className="dist-count">
                    {stats.categoryDistribution?.Family || 0} contacts (
                    {calculatePercentage(
                      stats.categoryDistribution?.Family,
                      stats.totalContacts
                    )}
                    %)
                  </span>
                </div>
                <div className="dist-progress-track">
                  <div
                    className="dist-progress-fill purple"
                    style={{
                      width: `${calculatePercentage(
                        stats.categoryDistribution?.Family,
                        stats.totalContacts
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Friends */}
              <div className="category-dist-row">
                <div className="dist-row-top">
                  <div className="dist-label-wrap">
                    <span className="dist-color-dot green"></span>
                    <strong className="dist-name">Friends</strong>
                  </div>
                  <span className="dist-count">
                    {stats.categoryDistribution?.Friends || 0} contacts (
                    {calculatePercentage(
                      stats.categoryDistribution?.Friends,
                      stats.totalContacts
                    )}
                    %)
                  </span>
                </div>
                <div className="dist-progress-track">
                  <div
                    className="dist-progress-fill green"
                    style={{
                      width: `${calculatePercentage(
                        stats.categoryDistribution?.Friends,
                        stats.totalContacts
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Others */}
              <div className="category-dist-row">
                <div className="dist-row-top">
                  <div className="dist-label-wrap">
                    <span className="dist-color-dot amber"></span>
                    <strong className="dist-name">Others</strong>
                  </div>
                  <span className="dist-count">
                    {stats.categoryDistribution?.Others || 0} contacts (
                    {calculatePercentage(
                      stats.categoryDistribution?.Others,
                      stats.totalContacts
                    )}
                    %)
                  </span>
                </div>
                <div className="dist-progress-track">
                  <div
                    className="dist-progress-fill amber"
                    style={{
                      width: `${calculatePercentage(
                        stats.categoryDistribution?.Others,
                        stats.totalContacts
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick summary footer */}
            <div className="category-summary-footer">
              <CheckCircle2 size={16} />
              <span>
                {stats.totalContacts || 0} contacts organized across{" "}
                {stats.activeCategoriesCount || 0} active categories.
              </span>
            </div>
          </div>
        </div>
      </div>

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

export default Dashboard;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Dynamic Time-of-Day Personalization:
   Computes greetings based on `new Date().getHours()` to provide
   a warm, natural user experience ("Good morning / afternoon / evening").

2. Real-Time MongoDB Analytics Rendering:
   Consumes live statistical metrics from ContactContext (totalContacts,
   favorites, activeCategoriesCount, categoryDistribution) without hardcoding.

3. Modal State Orchestration:
   Manages independent modal states for Add, Edit, View Details, and Delete
   confirmation dialogs, passing handler callbacks to keep data in sync.

4. Responsive CSS Grid & Flexbox:
   Uses CSS grid layouts for stat cards and dashboard panels that
   automatically adapt across desktop, tablet, and smartphone screens.

5. Direct Native Communication Links (tel: & mailto:):
   Renders clickable native action buttons inside recent contact rows
   to launch phone calls and emails immediately.
==================================================
*/
