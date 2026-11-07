/**
 * ==============================================================================
 * JWT Authentication Middleware
 * ==============================================================================
 * Intercepts incoming HTTP requests to protected routes, extracts and verifies
 * the JSON Web Token (JWT) from the Authorization header, retrieves the
 * authenticated user from MongoDB, and attaches them to `req.user`.
 * ==============================================================================
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware function to protect private API endpoints.
 * Blocks any request that does not include a valid, non-expired Bearer token.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for "Bearer <token>" in the Authorization request header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // If no token was found in the header, reject the request
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token is missing.",
      });
    }

    // Verify token validity using the server's secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from MongoDB using the ID stored inside the JWT payload
    // Exclude the hashed password field for safety
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account associated with this token no longer exists.",
      });
    }

    // Attach the authenticated user object to the Express request object
    // Subsequent controllers can now access `req.user` and `req.user._id`
    req.user = user;

    // Proceed to the next middleware or route handler in the chain
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    // Provide friendly error messages for common JWT verification failures
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token. Authorization failed.",
    });
  }
};

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Express Middleware:
   A function that has access to the request object (req), response
   object (res), and the next middleware function (next). It runs
   before route controllers to enforce prerequisites like authentication.

2. Bearer Authentication Scheme:
   The HTTP standard for sending tokens in the Authorization header:
   "Authorization: Bearer <token>". The token is extracted by splitting
   the string by space.

3. JWT Verification (jwt.verify):
   Cryptographically validates the token against the server's JWT_SECRET.
   If someone tampered with the token payload or if the token expired,
   jwt.verify throws an exception.

4. Database-backed Authorization:
   After verifying the token signature, the user is confirmed to still
   exist in MongoDB Atlas. Excluding the password hash with
   `.select("-password")` follows the principle of least privilege.

5. Attaching Context to `req.user`:
   Express allows custom properties to be assigned to the request object.
   Attaching the user document ensures downstream handlers can reliably
   scope all database queries to `req.user._id`.
==================================================
*/

