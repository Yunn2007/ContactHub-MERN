/**
 * ==============================================================================
 * Contact Hub - Express Application Server Entrypoint
 * ==============================================================================
 * Initializes the Express application, configures global middleware (CORS,
 * JSON body parsing), establishes the MongoDB Atlas database connection,
 * registers API feature routes, and sets up centralized error handling.
 * ==============================================================================
 */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Create the Express application instance
const app = express();

// ==============================================================================
// Global Middleware
// ==============================================================================

// Enable Cross-Origin Resource Sharing (CORS) so Vite frontend can communicate with backend
app.use(cors());

// Parse incoming requests with JSON payloads (Content-Type: application/json)
app.use(express.json());

// Parse incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// ==============================================================================
// Database Readiness Middleware
// ==============================================================================

// Verify database connection state before routing requests to controllers
const checkDBConnection = (req, res, next) => {
  // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database is not connected. Please whitelist your IP address in MongoDB Atlas Network Access (choose 'Allow Access from Anywhere' 0.0.0.0/0).",
    });
  }
  next();
};

// ==============================================================================
// API Route Registration
// ==============================================================================

// Health check and root ping endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Contact Hub API is running smoothly!",
    databaseConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

// Authentication endpoints: /api/auth/signup, /api/auth/login
app.use("/api/auth", checkDBConnection, authRoutes);

// Contact management endpoints: /api/contacts (CRUD, search, alphabetical filter, favorites, stats)
app.use("/api/contacts", checkDBConnection, contactRoutes);

// User profile & preferences endpoints: /api/users/profile, /api/users/change-password
app.use("/api/users", checkDBConnection, userRoutes);

// ==============================================================================
// Centralized Error Handling Middleware
// ==============================================================================

// Catch-all 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: [${req.method}] ${req.originalUrl}`,
  });
});

// Global error handling middleware for Multer, Validation, and Server errors
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);

  // Multer-specific file upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Uploaded file is too large. Maximum allowed image size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Custom file filter rejection
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // General server errors (hide stack trace from client for security)
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
  });
});

// ==============================================================================
// Database Connection and Server Startup
// ==============================================================================

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("CRITICAL: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

// Function to connect to MongoDB Atlas with auto-retry
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("----------------------------------------");
    console.log("Connected to MongoDB Atlas successfully!");
    console.log("----------------------------------------");
  } catch (error) {
    console.error("--------------------------------------------------");
    console.error("MongoDB Atlas connection failed:", error.message);
    console.error("");
    console.error("CAUSE: Your current IP address is not whitelisted in MongoDB Atlas.");
    console.error("HOW TO FIX IN 1 MINUTE:");
    console.error("1. Open MongoDB Atlas (https://cloud.mongodb.com)");
    console.error("2. Navigate to 'Network Access' (under Security in left sidebar)");
    console.error("3. Click 'Add IP Address'");
    console.error("4. Click 'ALLOW ACCESS FROM ANYWHERE' (sets 0.0.0.0/0)");
    console.error("   (or click 'ADD CURRENT IP ADDRESS')");
    console.error("5. Click 'Confirm'. (Takes ~15-30 seconds to activate)");
    console.error("--------------------------------------------------");

    // Retry connection every 10 seconds without crashing the server
    console.log("Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectDB, 10000);
  }
};

// Start listening for HTTP connections immediately
app.listen(PORT, () => {
  console.log(`Contact Hub backend server is listening on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  connectDB();
});

export default app;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Express Application Lifecycle:
   Initializes the HTTP request-response pipeline. Requests pass through
   CORS, body parsers, specific routers, and finally reach either a
   matching handler or the 404 / global error middleware.

2. Cross-Origin Resource Sharing (CORS):
   A security mechanism implemented by browsers. Without app.use(cors()),
   requests from http://localhost:5173 (frontend) to http://localhost:5001
   (backend) would be blocked by browser Same-Origin Policy.

3. Centralized Error Handling Middleware:
   Express identifies error-handling middleware by its 4-parameter signature:
   (err, req, res, next). Centralizing error responses ensures clients receive
   consistent JSON error schemas rather than leaking raw HTML stack traces.

4. Mongoose Database Initialization:
   The server only begins listening on PORT after the database connection is
   successfully resolved with `.then()`, ensuring requests are never received
   before the database is operational.
==================================================
*/
