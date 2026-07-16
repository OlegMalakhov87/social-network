import { classNames } from '../../lib';
import styles from './Toast.module.css';
/**
 * Компонент уведомления.
 *
 * @param {Object} props
 * @param {string} props.message
 * @param {string} props.type
 * @param {Function} props.onClose
 *
 */

export const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={classNames(styles.toast, styles[type])}>
      <span className={styles.icon}>{icons[type]}</span>

      <span className={styles.message}>{message}</span>

      <button onClick={onClose} className={styles.close}>
        ✕
      </button>
    </div>
  );
};
