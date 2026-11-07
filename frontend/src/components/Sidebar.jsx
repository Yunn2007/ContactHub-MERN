/**
 * ==============================================================================
 * Sidebar Navigation Component
 * ==============================================================================
 * Renders the primary navigation sidebar for the Contact Hub dashboard.
 * Displays the application logo, route navigation links with active state
 * indicators, user profile summary, and the logout action.
 * Supports drawer transitions for responsive mobile and tablet displays.
 * ==============================================================================
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
  ContactRound,
  LayoutDashboard,
  Users,
  Star,
  FolderKanban,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user logout and redirect
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Generate fallback initials for the user avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Sidebar Header / Brand Logo */}
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <span className="sidebar-brand-icon">
              <ContactRound size={22} />
            </span>
            <span className="sidebar-brand-text">
              contact<span className="brand-highlight">hub</span>
            </span>
          </NavLink>

          {/* Close button visible only on mobile screens */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Users size={19} />
            <span>All Contacts</span>
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Star size={19} />
            <span>Favorites</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <FolderKanban size={19} />
            <span>Categories</span>
          </NavLink>

          <div className="nav-section-label">PREFERENCES</div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* User Profile & Logout Section at Bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            {/* User profile picture or fallback avatar */}
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || "User"}
                className="user-avatar-img"
              />
            ) : (
              <div className="user-avatar-initials">{getUserInitials()}</div>
            )}

            <div className="user-details">
              <strong className="user-name" title={user?.name}>
                {user?.name || "Contact Hub User"}
              </strong>
              <span className="user-email" title={user?.email}>
                {user?.email || "user@example.com"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of Contact Hub"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React Router NavLink Component:
   A specialized Link component that automatically knows whether its route
   is active (`isActive` boolean), allowing conditional application of the
   `.active` CSS class to highlight current page.

2. Controlled Component Props:
   `isOpen` and `onClose` control the visibility of the mobile drawer.
   Closing the drawer when a link is clicked provides smooth mobile UX.

3. Avatar Fallback Logic:
   If the user has not uploaded a Cloudinary picture, `getUserInitials()`
   dynamically computes their first and last initials from their name.

4. Mobile Responsive Off-Canvas Drawer Pattern:
   The sidebar uses fixed positioning and CSS transforms (`translateX(-100%)`)
   to slide out gracefully on smaller screens when toggled by the user.
==================================================
*/

