import { useEffect } from 'react';

export default function Modal({ title, onClose, children, maxWidth = '560px' }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal is-open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal__dialog" style={{ maxWidth }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__header">
          <h3 className="modal__title" id="modal-title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
