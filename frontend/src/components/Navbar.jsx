/**
 * ==============================================================================
 * Navbar Component (Landing Page Header)
 * ==============================================================================
 * Public navigation bar rendered across the landing page.
 * Conditionally presents "Log in / Get Started" for visitors, or a direct
 * "Go to Dashboard" shortcut if the user is already logged in.
 * ==============================================================================
 */

import { Link } from "react-router-dom";
import { ContactRound, ArrowRight } from "lucide-react";
import { useAuth } from "../context/useAuth";
import "../styles/Navbar.css";

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      {/* Brand Logo & Application Title */}
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">
          <ContactRound size={23} />
        </div>
        <span>
          contact<span className="brand-highlight">hub</span>
        </span>
      </Link>

      {/* Feature & About In-Page Anchor Links */}
      <div className="navbar-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
      </div>

      {/* Authentication Action Links */}
      <div className="navbar-actions">
        {isAuthenticated ? (
          <Link to="/dashboard" className="nav-signup">
            <span>Dashboard</span>
            <ArrowRight size={15} style={{ marginLeft: 6, verticalAlign: "middle" }} />
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-login">
              Log in
            </Link>
            <Link to="/signup" className="nav-signup">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Dynamic Authentication Navigation (Ternary Conditional):
   Inspects `isAuthenticated` from AuthContext. Logged-in users see a
   direct "Dashboard" button, while unauthenticated guests see "Log in" and
   "Get Started" options.

2. React Router Link vs Standard Anchor (<a>):
   - Link: Intercepts clicks for client-side routing without reloading the document.
   - <a>: Used for smooth in-page fragment navigation (`#features`, `#about`).

3. CSS Glassmorphism:
   The navbar utilizes `backdrop-filter: blur(16px)` and semi-transparent
   backgrounds for a sleek floating dark aesthetic.
==================================================
*/

