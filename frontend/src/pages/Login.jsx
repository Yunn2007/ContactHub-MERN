
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ContactRound,
  ArrowLeft,
  LogIn,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import api from "../services/api";

import "../styles/Auth.css";

function Login() {
  // Redirect the user after successful login.
  const navigate = useNavigate();

  // Access the login function from AuthContext.
  const { login } = useAuth();

  // Store the email and password entered by the user.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Store error messages.
  const [message, setMessage] = useState("");

  // Track the login request status.
  const [loading, setLoading] = useState(false);

  // Update form values whenever the user types.
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  }

  // Handle login form submission.
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      // Send login credentials to the backend.
      const response = await api.post("/auth/login", formData);

      // Save the returned user details and JWT.
      login(response.data.user, response.data.token);

      // Redirect to the dashboard.
      navigate("/dashboard");

    } catch (error) {
      // Display the backend error message.
      setMessage(
        error.response?.data?.message ||
        "Unable to log in. Please try again."
      );
    } finally {
      // Stop the loading indicator.
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
            <LogIn size={23} />
          </div>

          <h1>Welcome back</h1>

          <p>Log in to manage your contacts.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>

            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
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
            {loading ? "Logging In..." : "Log In"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/signup"> Create one</Link>
        </p>

        <p className="auth-footer">
          Your contacts. Organized. Always accessible.
        </p>

      </div>
    </div>
  );
}

export default Login;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React useState Hook:
   Maintains local component state for form input values (email, password),
   asynchronous loading indicators, and error messages.

2. Controlled Form Inputs:
   HTML inputs whose value is controlled by React state (`value={formData.email}`)
   and updated via the `onChange` event handler, keeping React state the
   single source of truth.

3. React Router useNavigate Hook:
   Provides programmatic navigation capabilities (`navigate('/dashboard')`)
   to redirect the browser after successful asynchronous authentication.

4. Axios Integration (api.post):
   Dispatches HTTP POST requests to the Express backend endpoint `/api/auth/login`.

5. Context Consumption (useAuth):
   Invokes the `login(user, token)` method provided by AuthContext to persist
   credentials in global state and browser storage.
==================================================
*/
