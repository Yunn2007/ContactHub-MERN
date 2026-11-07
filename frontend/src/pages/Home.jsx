// Import Link to navigate between application pages.
import { Link } from "react-router-dom";

// Import icons for the feature cards.
import {
  ArrowRight,
  Users,
  ShieldCheck,
  Cloud,
  Search,
  Star,
  Zap
} from "lucide-react";

// Import the reusable Navbar component.
import Navbar from "../components/Navbar";

// Import Home page styling.
import "../styles/Home.css";

// Main Landing Page component.
function Home() {
  return (
    <div className="home-page">

      {/* Display the navigation bar. */}
      <Navbar />

      {/* Main hero section. */}
      <main className="hero-section">

        <div className="hero-content">

          {/* Small announcement label. */}
          <div className="hero-badge">
            <Zap size={14} />
            <span>Your contacts, beautifully organized</span>
          </div>

          {/* Main heading. */}
          <h1>
            Every connection.
            <br />
            <span>One place.</span>
          </h1>

          {/* Hero description. */}
          <p className="hero-description">
            Meet Contact Hub — a smarter way to organize, manage
            and keep track of the people who matter to you.
            Everything you need, all in one simple workspace.
          </p>

          {/* Hero action buttons. */}
          <div className="hero-actions">

            <Link to="/signup" className="hero-primary">
              Get Started Free
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="hero-secondary">
              Already have an account?
            </Link>

          </div>

          {/* Small trust indicator. */}
          <div className="hero-trust">
            <ShieldCheck size={17} />
            <span>Your contacts. Your space. Secure and private.</span>
          </div>

        </div>

        {/* Right-side visual preview. */}
        <div className="hero-visual">

          {/* Decorative glow behind the preview. */}
          <div className="visual-glow"></div>

          {/* Dashboard preview card. */}
          <div className="preview-window">

            <div className="preview-header">
              <div className="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span>Contact Hub</span>
            </div>

            <div className="preview-body">

              <div className="preview-welcome">
                <div>
                  <span>OVERVIEW</span>
                  <h3>Your workspace</h3>
                </div>

                <div className="preview-avatar">Y</div>
              </div>

              {/* Statistics preview. */}
              <div className="preview-stats">

                <div className="preview-stat">
                  <Users size={18} />
                  <span>Total contacts</span>
                  <strong>248</strong>
                </div>

                <div className="preview-stat">
                  <Star size={18} />
                  <span>Favorites</span>
                  <strong>36</strong>
                </div>

              </div>

              {/* Recent contacts preview. */}
              <div className="preview-contact-heading">
                <strong>Recent contacts</strong>
                <span>View all</span>
              </div>

              {/*
                Sample preview contacts.
                map() creates one preview row for every contact.
              */}
              {[
                { name: "Aarav Sharma", email: "aarav@example.com", initials: "AS" },
                { name: "Priya Mehta", email: "priya@example.com", initials: "PM" },
                { name: "Rahul Verma", email: "rahul@example.com", initials: "RV" }
              ].map((contact) => (
                <div className="preview-contact" key={contact.email}>

                  <div className="preview-contact-avatar">
                    {contact.initials}
                  </div>

                  <div className="preview-contact-info">
                    <strong>{contact.name}</strong>
                    <span>{contact.email}</span>
                  </div>

                  <Star size={16} className="preview-star" />

                </div>
              ))}

            </div>
          </div>
        </div>
      </main>

      {/* Features section. */}
      <section className="features-section" id="features">

        <div className="section-heading">
          <span>BUILT FOR SIMPLICITY</span>
          <h2>Everything in its right place.</h2>
          <p>
            Powerful contact management tools without the complexity.
          </p>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon purple">
              <Users size={23} />
            </div>
            <h3>Organize contacts</h3>
            <p>
              Keep all your important contacts organized
              in one convenient place.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <Star size={23} />
            </div>
            <h3>Save favorites</h3>
            <p>
              Quickly access your most important people
              whenever you need them.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <Cloud size={23} />
            </div>
            <h3>Cloud storage</h3>
            <p>
              Store profile images securely using
              cloud-based image management.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <Search size={23} />
            </div>
            <h3>Find instantly</h3>
            <p>
              Search and filter contacts to find
              exactly who you're looking for.
            </p>
          </div>

        </div>
      </section>

      {/* About section. */}
      <section className="about-section" id="about">
        <div>
          <span>CONTACT MANAGEMENT, SIMPLIFIED</span>
          <h2>Less searching. More connecting.</h2>
        </div>

        <Link to="/signup" className="about-button">
          Start organizing
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* Footer. */}
      <footer className="home-footer">
        <span>© 2026 Contact Hub. All rights reserved.</span>
        <span>Built to keep you connected.</span>
      </footer>

    </div>
  );
}

// Export the Home page.
export default Home;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React Functional Components:
   Stateless presentational component defining the visual structure
   of the public marketing and landing experience.

2. React Router Link Component:
   Enables instant client-side routing to /signup and /login pages
   without requesting new HTML pages from the server.

3. Array Mapping for UI Collections (map()):
   Transforms an array of preview contact objects into a list of
   rendered JSX elements using the unique `contact.email` as `key`.

4. Component Composition:
   Embedding the reusable `<Navbar />` inside `<Home />` separates
   navigation concerns from page content.
==================================================
*/