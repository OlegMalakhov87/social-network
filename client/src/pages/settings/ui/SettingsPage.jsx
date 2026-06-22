import { useState } from 'react';
import style from './SettingsPage.module.css';
import { SettingsToast } from '../../../widgets/settings';
import {
  EditProfileForm,
  ChangePasswordForm,
  NotificationToggle,
  PrivacySettings,
} from '../../../features/settings';

/**
 * Страница настроек пользователя.
 * Содержит боковое меню и контент выбранного раздела.
 */
export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notification, setNotification] = useState(null);

  // Показать уведомление на 5 секунд
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const menuItems = [
    { id: 'profile', icon: '👤', label: 'Профиль' },
    { id: 'account', icon: '🔐', label: 'Аккаунт' },
    { id: 'notifications', icon: '🔔', label: 'Уведомления' },
    { id: 'privacy', icon: '🔒', label: 'Приватность' },
    { id: 'appearance', icon: '🎨', label: 'Внешний вид' },
    { id: 'language', icon: '🌐', label: 'Язык' },
    { id: 'security', icon: '🛡️', label: 'Безопасность' },
    { id: 'help', icon: '❓', label: 'Помощь' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EditProfileForm showNotification={showNotification} />;
      case 'account':
        return <ChangePasswordForm showNotification={showNotification} />;
      case 'notifications':
        return <NotificationToggle />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return (
          <div className={style.placeholder}>
            <h2>Раздел в разработке</h2>
            <p>Скоро здесь появится полезная информация</p>
          </div>
        );
    }
  };

  return (
    <div className={style.settings}>
      <div className={style.header}>
        <h1 className={style.title}>Настройки</h1>
        <p className={style.subtitle}>Управляйте настройками вашего профиля и аккаунта</p>
      </div>

      {notification && (
        <SettingsToast notification={notification} setNotification={setNotification} />
      )}

      <div className={style.content}>
        <div className={style.sidebar}>
          <ul className={style.navList}>
            {menuItems.map((item) => (
              <li key={item.id} className={style.navItem}>
                <button
                  className={`${style.navButton} ${activeTab === item.id ? style.active : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={style.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={style.main}>{renderContent()}</div>
      </div>
    </div>
  );
};
