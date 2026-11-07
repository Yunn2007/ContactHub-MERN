/**
 * ==============================================================================
 * ProtectedRoute Component
 * ==============================================================================
 * Route guard component that verifies whether the user is logged in.
 * If authenticated, renders the requested child component.
 * If not authenticated, redirects the client to `/login` using React Router.
 * ==============================================================================
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to /login and preserve attempted path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected child routes when authenticated
  return children;
}

export default ProtectedRoute;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Route Guarding (Conditional Rendering):
   Ensures private dashboard pages cannot be viewed by unauthorized visitors.
   If `isAuthenticated` is false, the browser is redirected before any private
   DOM elements render.

2. React Router Navigate Component:
   Declarative navigation component that redirects the browser to a target
   URL (`/login`). The `replace` flag replaces the current entry in the history
   stack so the Back button doesn't trigger a redirect loop.

3. React Router useLocation Hook:
   Retrieves current URL location information, which can be passed via `state`
   so the login page can optionally redirect the user back to their intended
   destination after logging in.
==================================================
*/
