/**
 * ==============================================================================
 * Contact Hub - Frontend Application Root (App.jsx)
 * ==============================================================================
 * Declares the client-side routing structure using React Router DOM.
 * Integrates global context providers:
 * - <AuthProvider>: Supplies authentication state, credentials & session persistence
 * - <ContactProvider>: Manages contact domain records, statistics & toast alerts
 * Configures public routes (Home, Login, Signup) and protected application
 * views (Dashboard, Contacts, Favorites, Categories, Settings).
 * ==============================================================================
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Global Context Providers
import { AuthProvider } from "./context/AuthProvider";
import { ContactProvider } from "./context/ContactProvider";

// Route Security Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected Application Pages
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Favorites from "./pages/Favorites";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

// Global Stylesheet
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Marketing Landing Page */}
            <Route path="/" element={<Home />} />

            {/* 2. Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 3. Protected Dashboard Overview */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 4. Protected All Contacts Directory */}
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />

            {/* 5. Protected Favorite Contacts View */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />

            {/* 6. Protected Category Management View */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            {/* 7. Protected User Settings & Preferences */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 8. Fallback: Catch-all unknown routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ContactProvider>
    </AuthProvider>
  );
}

export default App;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React Router DOM (v7):
   - BrowserRouter: Uses HTML5 History API (pushState, replaceState) to keep
     the browser URL synchronized with the view without full page reloads.
   - Routes: Container that matches the current location to one of its child Routes.
   - Route: Binds a specific URL pathname (`path="/dashboard"`) to a component (`element={<Dashboard />}`).

2. Provider Composition Pattern:
   Nesting `<AuthProvider>` -> `<ContactProvider>` -> `<BrowserRouter>` ensures
   all pages have immediate access to both authentication states and contact data.

3. Protected Route Wrapping:
   Wrapping private routes with `<ProtectedRoute>` intercepts unauthenticated
   visitors and redirects them before any internal dashboard views mount.

4. Wildcard Fallback (`path="*"`):
   Gracefully handles broken or typed URLs by redirecting visitors back
   to a valid page (`/`) instead of showing an unstyled 404 screen.
==================================================
*/
