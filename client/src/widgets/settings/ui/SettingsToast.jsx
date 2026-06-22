import style from './SettingToast.module.css';

/**
 * Всплывающее уведомление (toast) для страницы настроек.
 * @param {Object} props
 * @param {Object} props.notification - { type: 'success'|'error'|'info', message }
 * @param {Function} props.setNotification - колбэк для сброса
 */

export const SettingsToast = ({ notification, setNotification }) => {
  const typeClass =
    notification.type === 'success'
      ? style.notificationSuccess
      : notification.type === 'error'
        ? style.notificationError
        : style.notificationInfo;

  const icon = notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`${style.notification} ${typeClass}`}>
      <span className={style.notificationIcon}>{icon}</span>
      <span className={style.notificationMessage}>{notification.message}</span>
      <button className={style.notificationClose} onClick={() => setNotification(null)}>
        ✕
      </button>
    </div>
  );
};
