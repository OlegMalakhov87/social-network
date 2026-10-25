import { Toast } from './Toast';

import styles from './Toast.module.css';

/**
 * Отображает список всплывающих уведомлений.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{id: number, message: string, type: string}>} props.toasts - Уведомления с идентификатором, текстом и типом
 * @param {Function} props.removeToast - Обработчик удаления уведомления
 * @returns {JSX.Element} Список уведомлений.
 */

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
