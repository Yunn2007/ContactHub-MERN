/**
 * ==============================================================================
 * useContacts Custom Hook
 * ==============================================================================
 * Hook to consume ContactContext with built-in validation.
 * ==============================================================================
 */

import { useContext } from "react";
import { ContactContext } from "./ContactContext";

export function useContacts() {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error("useContacts must be used within a <ContactProvider>");
  }

  return context;
}

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Custom Hook Abstraction:
   Hides the complexity of `useContext(ContactContext)` and provides
   a clean, readable API (`const { contacts, createContact } = useContacts()`).

2. Context Boundary Assertion:
   Ensures that components using contact operations are properly enclosed
   inside the `<ContactProvider>` wrapper.
==================================================
*/

