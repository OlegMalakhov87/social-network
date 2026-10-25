import { classNames } from '../../../utils';

import styles from './Toast.module.css';

/**
 * Отображает всплывающее уведомление.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.message - Текст уведомления
 * @param {'success'|'error'|'warning'|'info'} props.type - Тип уведомления
 * @param {Function} props.onClose - Обработчик закрытия
 * @returns {JSX.Element} Всплывающее уведомление.
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

      <button
        onClick={onClose}
        className={styles.close}
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
    </div>
  );
};
