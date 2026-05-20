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
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          onClick={() => removeToast(t.id)}
          role="alert"
        >
          <i className={`fas ${ICONS[t.type] || ICONS.info} toast__icon--${t.type}`} aria-hidden="true" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
