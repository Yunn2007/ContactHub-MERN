
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate a JWT token for an authenticated user.
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check whether all required fields are provided.
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Validate the email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check password length.
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    // Normalize the email before checking the database.
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the user already exists.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password before storing it.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user in MongoDB.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate a JWT for the newly registered user.
    const token = generateToken(user._id);

    // Return safe user information and the token.
    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle duplicate email index errors.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message?.includes("buffering timed out")
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Database connection timed out. Please whitelist your current IP address in MongoDB Atlas Network Access.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check whether both fields are provided.
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find the user using their normalized email.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare the entered password with its stored hash.
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate a JWT after successful authentication.
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Provide descriptive diagnostic if MongoDB cluster is unreachable
    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message?.includes("buffering timed out")
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Database connection timed out. Please whitelist your current IP address in MongoDB Atlas Network Access.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. JWT Token Generation (jwt.sign):
   Creates a cryptographically signed compact token containing the user's
   unique ID in its payload. The client presents this token in subsequent
   requests to authenticate without sending passwords again.

2. Password Hashing with Salt (bcrypt.hash):
   Uses the Blowfish-based adaptive hashing algorithm with 12 salt rounds.
   Even identical passwords result in completely different hashes, protecting
   users against rainbow table and brute-force attacks.

3. Constant-Time Hash Comparison (bcrypt.compare):
   Compares the plain-text password from the login form against the stored
   hash in constant time, preventing timing side-channel attacks.

4. Data Sanitization & Normalization:
   Trimming and lowercasing email addresses before checking the database
   ensures case-insensitive lookups and prevents duplicate accounts like
   "User@Example.com" and "user@example.com".

5. RESTful HTTP Status Codes:
   - 200 OK: Successful login.
   - 201 Created: Successful user registration.
   - 400 Bad Request: Missing or invalid form inputs.
   - 401 Unauthorized: Invalid credentials.
   - 409 Conflict: Duplicate email registration.
   - 500 Internal Server Error: Unhandled server errors.
==================================================
*/
