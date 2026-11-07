/**
 * ==============================================================================
 * Settings Page Component
 * ==============================================================================
 * Comprehensive user account management and settings suite.
 * Features:
 * - Profile Settings: Name, Email, and Cloudinary Avatar upload / replacement / removal
 * - Account Security: Secure password change with current password verification
 * - Contact Preferences: Default sorting, default category, and default view mode
 * - Instant global profile synchronization across the sidebar, header, and dashboard
 * - Secure logout action
 * ==============================================================================
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Sliders,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
  Shield,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/useAuth";
import { useContacts } from "../context/useContacts";
import api from "../services/api";

/**
 * Profile Settings Sub-Form
 * Uses key={user?.email} so state resets cleanly whenever user data changes.
 */
function ProfileForm({ user, updateUser, showToast }) {
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size cannot exceed 5MB.");
      return;
    }

    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError("");
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!profileForm.name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }

    if (!profileForm.email.trim()) {
      setProfileError("Email cannot be empty.");
      return;
    }

    try {
      setProfileLoading(true);

      const formData = new FormData();
      formData.append("name", profileForm.name.trim());
      formData.append("email", profileForm.email.trim());

      if (avatarFile) {
        formData.append("image", avatarFile);
      } else if (removeAvatar) {
        formData.append("removeImage", "true");
      }

      const response = await api.put("/users/profile", formData);

      updateUser(response.data.user);
      showToast("Profile updated successfully!", "success");
      setAvatarFile(null);
      setRemoveAvatar(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileError(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h3>Personal Information</h3>
        <p>Update your photo and personal profile details.</p>
      </div>

      <form onSubmit={handleSaveProfile} className="settings-form">
        {profileError && (
          <div className="form-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{profileError}</span>
          </div>
        )}

        {/* Avatar Row */}
        <div className="settings-avatar-row">
          <div className="settings-avatar-box">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="User avatar preview"
                className="settings-avatar-img"
              />
            ) : (
              <div className="settings-avatar-initials">
                {getUserInitials()}
              </div>
            )}
          </div>

          <div className="settings-avatar-controls">
            <strong>Profile Avatar</strong>
            <p>
              Upload your avatar to Cloudinary for display in the sidebar and
              dashboard.
            </p>

            <div className="settings-avatar-buttons">
              <button
                type="button"
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>{avatarPreview ? "Change Photo" : "Upload Photo"}</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  className="btn-remove-photo"
                  onClick={handleRemoveAvatar}
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
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="form-grid">
          <div className="form-field full-width">
            <label htmlFor="settings-name">Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                id="settings-name"
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="settings-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="settings-email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
        </div>

        <div className="settings-form-footer">
          <button
            type="submit"
            className="btn-primary-action"
            disabled={profileLoading}
          >
            {profileLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Account Security Sub-Form (Password Change)
 */
function SecurityForm({ showToast }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      await api.patch("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      showToast("Password changed successfully!", "success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h3>Account Security</h3>
        <p>Ensure your account is protected with a strong password.</p>
      </div>

      <form onSubmit={handleChangePassword} className="settings-form">
        {passwordError && (
          <div className="form-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="form-grid">
          <div className="form-field full-width">
            <label htmlFor="current-password">Current Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="new-password">New Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                id="new-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="settings-form-footer">
          <button
            type="submit"
            className="btn-primary-action"
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Contact Preferences Sub-Form
 */
function PreferencesForm({ user, updateUser, showToast, setSortOption, setSelectedCategory, setViewMode }) {
  const [prefForm, setPrefForm] = useState({
    defaultSort: user?.preferences?.defaultSort || "name-asc",
    defaultCategory: user?.preferences?.defaultCategory || "All",
    preferredView: user?.preferences?.preferredView || "grid",
  });
  const [prefLoading, setPrefLoading] = useState(false);

  const handleSavePreferences = async (e) => {
    e.preventDefault();

    try {
      setPrefLoading(true);

      const response = await api.patch("/users/preferences", prefForm);

      updateUser({ preferences: response.data.preferences });

      if (prefForm.defaultSort) setSortOption(prefForm.defaultSort);
      if (prefForm.defaultCategory) setSelectedCategory(prefForm.defaultCategory);
      if (prefForm.preferredView) setViewMode(prefForm.preferredView);

      showToast("Preferences saved successfully!", "success");
    } catch (err) {
      console.error("Preferences update error:", err);
      showToast("Failed to save preferences.", "error");
    } finally {
      setPrefLoading(false);
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h3>Directory Preferences</h3>
        <p>Customize your default sorting, categories, and layout.</p>
      </div>

      <form onSubmit={handleSavePreferences} className="settings-form">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="pref-sort">Default Contact Sorting</label>
            <select
              id="pref-sort"
              value={prefForm.defaultSort}
              onChange={(e) =>
                setPrefForm((prev) => ({
                  ...prev,
                  defaultSort: e.target.value,
                }))
              }
              className="toolbar-select full-width-select"
            >
              <option value="name-asc">Alphabetical: A to Z</option>
              <option value="name-desc">Alphabetical: Z to A</option>
              <option value="newest">Recently Added First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="pref-category">Default Category Filter</label>
            <select
              id="pref-category"
              value={prefForm.defaultCategory}
              onChange={(e) =>
                setPrefForm((prev) => ({
                  ...prev,
                  defaultCategory: e.target.value,
                }))
              }
              className="toolbar-select full-width-select"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-field full-width">
            <label htmlFor="pref-view">Preferred Display Mode</label>
            <select
              id="pref-view"
              value={prefForm.preferredView}
              onChange={(e) =>
                setPrefForm((prev) => ({
                  ...prev,
                  preferredView: e.target.value,
                }))
              }
              className="toolbar-select full-width-select"
            >
              <option value="grid">Grid Cards (Visual cards with avatars)</option>
              <option value="table">Table View (Dense, scannable data rows)</option>
            </select>
          </div>
        </div>

        <div className="settings-form-footer">
          <button
            type="submit"
            className="btn-primary-action"
            disabled={prefLoading}
          >
            {prefLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { showToast, setSortOption, setSelectedCategory, setViewMode } = useContacts();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="contacts-page-header">
        <div>
          <h1 className="page-title">Settings & Account</h1>
          <p className="page-subtitle">
            Manage your personal profile, security credentials, and directory
            preferences.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs-bar">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} />
          <span>Profile Information</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={16} />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          <Sliders size={16} />
          <span>Contact Preferences</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <ProfileForm
          key={user?.email || "profile"}
          user={user}
          updateUser={updateUser}
          showToast={showToast}
        />
      )}

      {/* Tab 2: Security */}
      {activeTab === "security" && (
        <SecurityForm showToast={showToast} />
      )}

      {/* Tab 3: Preferences */}
      {activeTab === "preferences" && (
        <PreferencesForm
          key={user?.email || "pref"}
          user={user}
          updateUser={updateUser}
          showToast={showToast}
          setSortOption={setSortOption}
          setSelectedCategory={setSelectedCategory}
          setViewMode={setViewMode}
        />
      )}

      {/* Danger Zone: Logout Section */}
      <div className="settings-panel danger-panel">
        <div className="settings-panel-header">
          <h3>Session & Authentication</h3>
          <p>Sign out of your Contact Hub session on this device.</p>
        </div>

        <div className="danger-panel-body">
          <p>
            Logging out clears your stored JSON Web Token and user session from
            local storage, preventing further access to your protected contact
            data until you sign back in.
          </p>

          <button
            type="button"
            className="btn-logout-danger"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out of Contact Hub</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Sub-Form Component Modularization:
   Breaking the settings page into `ProfileForm`, `SecurityForm`, and
   `PreferencesForm` isolates local states, reduces re-render scope,
   and cleanly eliminates setState-in-effect anti-patterns.

2. Full Cloudinary Avatar Pipeline:
   Uploads local files via multipart/form-data to Express Multer and Cloudinary,
   instantly propagating the updated Cloudinary URL to `useAuth().updateUser`
   to ensure the sidebar, header, and profile cards update in real time.

3. Multi-Step Password Verification:
   Enforces current password submission before hashing new credentials,
   preventing unauthorized password modifications.

4. Client Preference Persistence:
   Stores user UI preferences (default sort, default category, grid/table view)
   in MongoDB Atlas and updates context state immediately.

5. Secure Session Termination:
   The logout action purges localStorage authentication tokens and redirects
   unauthorized clients away from protected routes.
==================================================
*/
