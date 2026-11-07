/**
 * ==============================================================================
 * Dashboard Layout Wrapper Component
 * ==============================================================================
 * Standard application frame containing the persistent sidebar, top mobile
 * header, main view scroll area, and toast feedback notifications.
 * ==============================================================================
 */

import { useState } from "react";
import { Menu, ContactRound } from "lucide-react";
import Sidebar from "./Sidebar";
import Toast from "./Toast";
import "../styles/Dashboard.css";

function DashboardLayout({ children }) {
  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-root">
      {/* Toast Notification Container */}
      <Toast />

      {/* Top Navigation Bar visible only on mobile/tablet */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar navigation"
        >
          <Menu size={22} />
        </button>

        <div className="mobile-brand">
          <span className="mobile-brand-icon">
            <ContactRound size={18} />
          </span>
          <span>
            contact<span className="brand-highlight">hub</span>
          </span>
        </div>
      </header>

      {/* Persistent Sidebar (desktop) / Drawer (mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="dashboard-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Layout Wrapper Pattern:
   Encapsulates recurring layout elements (Sidebar, Mobile Header, Toast)
   in a single higher-level component, keeping individual page views
   focused purely on their own domain logic.

2. React Children Prop:
   `{children}` allows any page component (Dashboard, Contacts, Settings)
   to be passed inside the layout shell dynamically.

3. Responsive Off-Canvas Toggle State:
   `useState(false)` manages whether the mobile drawer is open or closed,
   passed down to the Sidebar as a controlled prop.
==================================================
*/

