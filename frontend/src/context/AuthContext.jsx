/**
 * ==============================================================================
 * AuthContext Definition
 * ==============================================================================
 * Creates the React Context object used to propagate authentication state
 * throughout the Contact Hub component tree.
 * ==============================================================================
 */

import { createContext } from "react";

// Shared context object initialized to null
export const AuthContext = createContext(null);

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React createContext:
   Instantiates a context object that components can subscribe to using
   the useContext hook. When the Provider's value changes, all descendant
   consumers automatically re-render with the latest state.
==================================================
*/
