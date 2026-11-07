/**
 * ==============================================================================
 * Delete Confirmation Modal Component
 * ==============================================================================
 * Guardrail confirmation modal that prevents accidental deletion of contact records.
 * Prompts the user before invoking the backend DELETE API and purging
 * associated Cloudinary media assets.
 * ==============================================================================
 */

import { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, contact }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !contact) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm(contact._id);
      onClose();
    } catch (error) {
      console.error("Deletion confirmation error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-header">
          <div className="delete-warning-icon">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close confirmation dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h3>Delete Contact</h3>
          <p>
            Are you sure you want to permanently delete{" "}
            <strong>{contact.name}</strong>?
          </p>
          <span className="delete-warning-note">
            This action cannot be undone. All contact details and any stored
            profile images will be purged from the system.
          </span>
        </div>

        <div className="delete-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-danger-delete"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;

/*
==================================================
CONCEPTS USED IN THIS FILE
==================================================

1. Destructive Action Confirmation Pattern:
   Safeguards user data against accidental clicks by inserting an explicit
   confirmation checkpoint before firing irreversible HTTP DELETE mutations.

2. Modal Dismissal Propagation:
   Supports dismissing via the "Cancel" button, top-right "X" icon, or
   clicking outside on the dimmed backdrop overlay.

3. Async Feedback with Spinner:
   Disables buttons and displays a spinner during the deletion network call
   to prevent duplicate clicks or race conditions.
==================================================
*/

