import style from './FormNotification.module.css';

/**
 * Всплывающее уведомление для форм.
 * @param {Object} props
 * @param {Object} props.notification - { type: 'success'|'error'|'info', message }
 * @param {Function} props.onClose - закрыть уведомление
 */
export const FormNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  const typeClass =
    notification.type === 'success'
      ? style.success
      : notification.type === 'error'
        ? style.error
        : style.info;

  const icon = notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`${style.notification} ${typeClass}`}>
      <span className={style.icon}>{icon}</span>
      <span className={style.message}>{notification.message}</span>
      <button className={style.closeButton} onClick={onClose}>
        ✕
      </button>
    </div>
  );
};
