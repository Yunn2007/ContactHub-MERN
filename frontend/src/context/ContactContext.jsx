/**
 * ==============================================================================
 * ContactContext Definition
 * ==============================================================================
 * Shared context object for Contact Hub directory state and operations.
 * Kept in its own file to support React Fast Refresh.
 * ==============================================================================
 */

import { createContext } from "react";

export const ContactContext = createContext(null);

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. React createContext:
   Instantiates the ContactContext container allowing contact list state,
   filter parameters, and mutation functions to be broadcast across the app.
==================================================
*/
