/**
 * ==============================================================================
 * AuthProvider Component (Authentication Context Provider)
 * ==============================================================================
 * Manages the global authentication state for Contact Hub.
 * Stores the authenticated user object and JWT in React state and synchronizes
 * them with the browser's localStorage for session persistence across page refreshes.
 * ==============================================================================
 */

import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  // Initialize user state from localStorage to persist login across browser refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  // Initialize JWT token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  /**
   * Store credentials after successful login or signup
   * @param {object} userData - Sanitized user info (id, name, email, profileImage, preferences)
   * @param {string} authToken - Signed JSON Web Token
   */
  function login(userData, authToken) {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);

    setUser(userData);
    setToken(authToken);
  }

  /**
   * Update the cached user object in state and localStorage without requiring re-login
   * Useful when updating profile name, email, avatar, or preferences
   * @param {object} updatedFields - New user properties to merge
   */
  function updateUser(updatedFields) {
    setUser((prevUser) => {
      const mergedUser = { ...prevUser, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });
  }

  /**
   * Clear credentials during logout and reset authentication state
   */
  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React Context API (Provider Pattern):
   Allows authentication state (user, token, login, logout) to be shared
   globally across the entire component tree without props drilling.

2. Lazy State Initialization (`useState(() => ...)`):
   Passing a function to useState executes the localStorage check only
   once during initial mounting, avoiding expensive synchronous disk reads
   on subsequent component re-renders.

3. Client-Side Session Persistence (localStorage):
   Stores JSON-serialized user data and the JWT in the browser's local
   storage so the user stays logged in even after closing or refreshing the tab.

4. Immutability & Functional State Updates:
   `setUser((prevUser) => ({ ...prevUser, ...updatedFields }))` merges new
   profile fields into state safely without mutating previous state objects.
==================================================
*/
