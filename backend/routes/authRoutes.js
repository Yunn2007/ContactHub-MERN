
import express from "express";
import { signup, login } from "../controllers/authController.js";

// Create an Express router.
const router = express.Router();

// Registration endpoint.
router.post("/signup", signup);

// Login endpoint.
router.post("/login", login);

export default router;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Express Router Modularization:
   Encapsulates all authentication-related endpoints in an isolated
   mini-application, keeping the main server.js clean and scalable.

2. Route Declarations:
   Maps HTTP POST methods to their respective controller handler functions:
   - POST /api/auth/signup -> signup controller
   - POST /api/auth/login  -> login controller
==================================================
*/
