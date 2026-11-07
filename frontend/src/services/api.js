/**
 * ==============================================================================
 * Axios HTTP Client Instance and Interceptors
 * ==============================================================================
 * Configures an Axios instance with base backend API URL, default headers,
 * request interceptor to automatically inject the Bearer JWT, and response
 * interceptor for centralized error diagnostics.
 * ==============================================================================
 */

import axios from "axios";

// Create a pre-configured Axios instance
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // When sending FormData (multipart/form-data for image uploads),
    // let the browser set the boundary header automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server explicitly rejected the token as expired or invalid
    if (error.response && error.response.status === 401) {
      // If we are currently on a protected route, we can notify or handle logout
      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/signup" ||
        window.location.pathname === "/";

      if (!isAuthRoute && localStorage.getItem("token")) {
        console.warn("Session expired or unauthorized. Clearing credentials.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Axios Instance (axios.create):
   Creates an isolated Axios client instance with predefined defaults
   (baseURL, timeout, headers), preventing repetitive URL prefixes across components.

2. Axios Request Interceptor:
   A middleware layer for HTTP requests. Before each request leaves the
   browser, the interceptor checks localStorage for an auth token and attaches
   it as a Bearer authorization header.

3. Multipart/Form-Data Boundary Auto-Detection:
   When sending FormData objects containing file attachments, explicitly
   deleting the default 'Content-Type': 'application/json' allows Axios and
   the browser to compute the correct `multipart/form-data; boundary=...` header.

4. Axios Response Interceptor:
   Intercepts HTTP responses before they are resolved in component code.
   If a 401 Unauthorized status occurs (e.g. expired JWT), it cleans up
   stale tokens and redirects to the login screen.
==================================================
*/
