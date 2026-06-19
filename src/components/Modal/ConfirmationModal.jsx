import './ConfirmationModal.css';

export function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay">
      <div className="modal-content-card">
        <div className="modal-header">
          <span className="modal-warning-icon">⚠️</span>
          <h3>{title}</h3>
        </div>
        <p className="modal-body-text">{message}</p>
        <div className="modal-actions-row">
          <button className="btn-modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-modal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
