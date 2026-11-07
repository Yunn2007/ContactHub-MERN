/**
 * ==============================================================================
 * useAuth Custom Hook
 * ==============================================================================
 * Convenient custom React hook providing direct access to the AuthContext values
 * (user, token, isAuthenticated, login, logout, updateUser).
 * ==============================================================================
 */

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Access the active authentication context.
 * Throws an error if used outside an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }

  return context;
}

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Custom React Hook:
   A JavaScript function whose name starts with "use" and that can call
   other React hooks. It encapsulates reusable context consumption logic.

2. React useContext Hook:
   Accepts a context object (AuthContext) and returns the current context
   value given by the nearest <AuthContext.Provider> higher in the tree.

3. Fail-Fast Boundary Validation:
   Checking if the context is undefined prevents silent errors and gives
   developers immediate feedback if they forget to wrap components with
   the Provider.
==================================================
*/
