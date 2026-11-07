/**
 * ==============================================================================
 * Toast Notification Component
 * ==============================================================================
 * Renders an animated floating alert badge at the top-right of the screen
 * to provide non-intrusive feedback for actions like creating, editing,
 * deleting, or favoriting contacts.
 * ==============================================================================
 */

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useContacts } from "../context/useContacts";

function Toast() {
  const { toast, dismissToast } = useContacts();

  if (!toast) return null;

  // Determine icon and style based on toast type
  const isError = toast.type === "error";
  const isInfo = toast.type === "info";

  return (
    <div className={`toast-notification ${toast.type || "success"}`} role="alert">
      <div className="toast-icon">
        {isError && <AlertCircle size={18} />}
        {isInfo && <Info size={18} />}
        {!isError && !isInfo && <CheckCircle2 size={18} />}
      </div>

      <span className="toast-message">{toast.message}</span>

      <button
        type="button"
        className="toast-close"
        onClick={dismissToast}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default Toast;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Conditional Rendering:
   If `toast` is null, the component returns `null` and renders nothing
   in the DOM, saving browser resources.

2. ARIA Accessibility (`role="alert"`):
   Informs assistive technologies (screen readers) that a dynamic status
   message has appeared without moving the user's focus.

3. Dynamic CSS Classes:
   Applying `${toast.type || 'success'}` binds CSS theme variations
   (green for success, red for error, indigo for info) based on state.
==================================================
*/

