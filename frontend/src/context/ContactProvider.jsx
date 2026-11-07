/**
 * ==============================================================================
 * ContactProvider Component
 * ==============================================================================
 * Central state management provider for Contacts across the Contact Hub application.
 * Manages:
 * - Active contacts list
 * - Dashboard statistics
 * - Live search, category filters, alphabetical filters, and sorting
 * - Contact CRUD operations with real-time state synchronization
 * - Floating toast notifications (success / error feedback)
 * ==============================================================================
 */

import { useState, useCallback, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";
import { ContactContext } from "./ContactContext";

export function ContactProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // Core domain state
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalFavorites: 0,
    activeCategoriesCount: 0,
    recentlyAddedCount: 0,
    categoryDistribution: { Work: 0, Family: 0, Friends: 0, Others: 0 },
    recentContacts: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Active filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid");

  /**
   * Display a floating toast notification that auto-dismisses after 4 seconds
   */
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  /**
   * Dismiss the current toast immediately
   */
  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * Fetch contacts from backend with current filter parameters
   */
  const fetchContacts = useCallback(
    async (overrideParams = {}) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);

        const params = {
          search: overrideParams.search !== undefined ? overrideParams.search : searchQuery,
          letter: overrideParams.letter !== undefined ? overrideParams.letter : selectedLetter,
          category: overrideParams.category !== undefined ? overrideParams.category : selectedCategory,
          sort: overrideParams.sort !== undefined ? overrideParams.sort : sortOption,
          favorite: overrideParams.favorite !== undefined ? overrideParams.favorite : undefined,
        };

        const response = await api.get("/contacts", { params });
        setContacts(response.data.contacts || []);
        return response.data.contacts;
      } catch (error) {
        console.error("Failed to load contacts:", error);
        showToast(
          error.response?.data?.message || "Failed to load contacts.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, searchQuery, selectedLetter, selectedCategory, sortOption, showToast]
  );

  /**
   * Fetch live dashboard statistics from the backend
   */
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setStatsLoading(true);
      const response = await api.get("/contacts/stats");
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create a new contact and refresh statistics
   */
  const createContact = async (formData) => {
    try {
      const response = await api.post("/contacts", formData);
      showToast("Contact created successfully!", "success");
      fetchContacts();
      fetchStats();
      return { success: true, contact: response.data.contact };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to create contact.";
      showToast(errorMsg, "error");
      return { success: false, message: errorMsg };
    }
  };

  /**
   * Update an existing contact and refresh statistics
   */
  const updateContact = async (contactId, formData) => {
    try {
      const response = await api.put(`/contacts/${contactId}`, formData);
      showToast("Contact updated successfully!", "success");
      fetchContacts();
      fetchStats();
      return { success: true, contact: response.data.contact };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update contact.";
      showToast(errorMsg, "error");
      return { success: false, message: errorMsg };
    }
  };

  /**
   * Delete a contact and sync UI state immediately
   */
  const deleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      showToast("Contact deleted successfully.", "success");
      setContacts((prev) => prev.filter((c) => c._id !== contactId));
      fetchStats();
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete contact.";
      showToast(errorMsg, "error");
      return { success: false, message: errorMsg };
    }
  };

  /**
   * Toggle a contact's favorite status and synchronize across all screens
   */
  const toggleFavorite = async (contactId) => {
    try {
      const response = await api.patch(`/contacts/${contactId}/favorite`);
      const updated = response.data.contact;

      setContacts((prev) =>
        prev.map((c) => (c._id === contactId ? updated : c))
      );

      fetchStats();
      showToast(response.data.message, "success");
      return { success: true, contact: updated };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to toggle favorite status.";
      showToast(errorMsg, "error");
      return { success: false, message: errorMsg };
    }
  };

  // Automatically load stats whenever the user logs in
  useEffect(() => {
    let isSubscribed = true;
    if (isAuthenticated) {
      api
        .get("/contacts/stats")
        .then((response) => {
          if (isSubscribed && response.data?.stats) {
            setStats(response.data.stats);
          }
        })
        .catch((err) => {
          console.error("Initial stats load error:", err);
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isAuthenticated]);

  return (
    <ContactContext.Provider
      value={{
        contacts,
        stats,
        loading,
        statsLoading,
        toast,
        showToast,
        dismissToast,
        searchQuery,
        setSearchQuery,
        selectedLetter,
        setSelectedLetter,
        selectedCategory,
        setSelectedCategory,
        sortOption,
        setSortOption,
        viewMode,
        setViewMode,
        fetchContacts,
        fetchStats,
        createContact,
        updateContact,
        deleteContact,
        toggleFavorite,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Global Domain State Management:
   Encapsulating all contact-related data and mutation methods inside
   a single Context ensures that modifying a contact on one screen
   (e.g., Favorites) instantaneously reflects on all other screens
   (Dashboard, All Contacts, Categories).

2. useCallback Hook:
   Memoizes callback functions (fetchContacts, fetchStats, showToast)
   so their function references remain stable across re-renders,
   preventing unnecessary useEffect triggering and infinite loops.

3. Async Data Fetching in Effects with Cancellation:
   The `isSubscribed` boolean guard in `useEffect` prevents setting state
   on an unmounted component if the network call resolves after navigation.

4. Centralized Toast Notification Dispatch:
   Components can trigger feedback toasts with a simple call: `showToast("Message", "success")`,
   which handles auto-dismissal timeouts cleanly.
==================================================
*/

