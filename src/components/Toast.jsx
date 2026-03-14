import { useToast } from '../context/AppContext';

const ICONS = {
  success: 'fa-circle-check',
  error:   'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info:    'fa-circle-info',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <i className={`fas ${ICONS[t.type] || ICONS.info} toast__icon`} aria-hidden="true" />
          <span className="toast__message">{t.message}</span>
          <button className="toast__close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
