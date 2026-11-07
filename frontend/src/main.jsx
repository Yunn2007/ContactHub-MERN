/**
 * ==============================================================================
 * React Application Mounting Point (main.jsx)
 * ==============================================================================
 * Mounts the Contact Hub React application onto the DOM container element
 * located in index.html with StrictMode diagnostics enabled.
 * ==============================================================================
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Locate the root DOM element in index.html and initialize React concurrent root
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React Concurrent Root (createRoot):
   The React 18+ entry point imported from "react-dom/client". It initializes
   the React fiber tree and manages rendering into the browser DOM.

2. React StrictMode:
   A development-only tool that highlights potential bugs, warns about
   deprecated APIs, and intentionally double-invokes effects in dev mode
   to catch cleanup memory leaks early.
==================================================
*/
