
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ContactRound,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import api from "../services/api";

import "../styles/Auth.css";

function Signup() {
  // Used to redirect the user after successful registration.
  const navigate = useNavigate();

  // Access the login function from our authentication context.
  const { login } = useAuth();

  // Store all signup form values.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Store error or success messages.
  const [message, setMessage] = useState("");

  // Track whether the signup request is in progress.
  const [loading, setLoading] = useState(false);

  // Update form state whenever the user types.
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  }

  // Handle form submission.
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    // Validate password length.
    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    // Check whether both passwords match.
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Send signup details to the backend.
      const response = await api.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Save the returned user details and JWT.
      login(response.data.user, response.data.token);

      // Redirect to the dashboard after registration.
      navigate("/dashboard");

    } catch (error) {
      // Display the error returned by the backend.
      setMessage(
        error.response?.data?.message ||
        "Unable to create your account. Please try again."
      );
    } finally {
      // Stop the loading state regardless of the result.
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-back">
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">
            <ContactRound size={23} />
          </span>

          <span>
            contact<span className="brand-highlight">hub</span>
          </span>
        </Link>

        <div className="auth-heading">
          <div className="auth-icon">
            <UserPlus size={23} />
          </div>

          <h1>Create your account</h1>

          <p>
            Start organizing your contacts in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>

            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>

            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?
          <Link to="/login"> Log in</Link>
        </p>

        <p className="auth-footer">
          Your contacts. Organized. Always accessible.
        </p>

      </div>
    </div>
  );
}

export default Signup;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Client-Side Input Validation:
   Checks password minimum length and confirms password match
   before sending network traffic to the server, improving responsiveness.

2. React Form Handling (e.preventDefault):
   Prevents the browser's default form submission behavior (which reloads
   the entire page) so JavaScript can process the request asynchronously.

3. Async/Await Error Handling:
   Uses try/catch/finally blocks to handle backend HTTP error responses
   (e.g., 409 Conflict for duplicate emails) and reset the loading spinner.

4. Dynamic State Updates with Computed Property Names:
   `[name]: value` inside `setFormData` allows one generic input change handler
   to update multiple distinct form fields dynamically.
==================================================
*/
