import { Toast } from './Toast';
import styles from './Toast.module.css';

/**
 * Контейнер уведомлений.
 *
 * @param {Object} props
 * @param {Array<{id:string,message:string,type:string}>} props.toasts
 * @param {Function} props.removeToast
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
