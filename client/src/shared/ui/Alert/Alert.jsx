import style from './Alert.module.css';

/**
 * Всплывающее уведомление для форм.
 * @param {Object} props
 * @param {string} props.variant - 'success'|'error'|'info'|'warning'
 * @param {string} props.title - заголовок уведомления
 * @param {boolean} props.closable - показываем крестик или нет
 * @param {string} props.children - сообщение
 * @param {Function} props.onClose - закрыть уведомление
 */
export const Alert = ({ variant, title, closable, children, onClose }) => {
  if (!children) return null;

  const icons = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  };

  const typeClass = style[variant];

  return (
    <div className={`${style.notification} ${typeClass}`}>
      <span className={style.icon}>{icons}</span>
      <span className={style.title}>{title}</span>
      <span className={style.message}>{children}</span>
      {closable && (
        <button className={style.closeButton} onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};
