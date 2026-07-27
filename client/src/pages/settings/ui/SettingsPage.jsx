import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import {
  AppearanceSettings,
  ChangePasswordForm,
  EditProfileForm,
  NotificationToggle,
  PrivacySettings,
} from '../../../features/settings';
import {
  Button,
  ErrorBoundary,
  PageLayout,
  PageLoader,
  SectionCard,
  Text,
} from '../../../shared/ui';
import style from './SettingsPage.module.css';

const MENU_ITEMS = [
  { id: 'profile', icon: '👤', label: 'Профиль' },
  { id: 'account', icon: '🔐', label: 'Аккаунт' },
  { id: 'appearance', icon: '🎨', label: 'Внешний вид' },
  { id: 'notifications', icon: '🔔', label: 'Уведомления' },
  { id: 'privacy', icon: '🔒', label: 'Приватность' },
];

/**
 * Компонент страницы настроек.
 *
 */
export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const currentUser = useSelector(selectUser);

  /**  Состояние загрузки всей страницы */
  if (!currentUser) {
    return <PageLoader message="Загружаем страницу настроек..." />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EditProfileForm currentUser={currentUser} />;
      case 'account':
        return <ChangePasswordForm currentUser={currentUser} />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationToggle currentUser={currentUser} />;
      case 'privacy':
        return <PrivacySettings currentUser={currentUser} />;
      default:
        return <Text>Раздел в разработке</Text>;
    }
  };

  return (
    <ErrorBoundary>
      <PageLayout
        title="Настройки"
        description="Управляйте настройками вашего профиля и аккаунта"
      >
        <SectionCard className={style.settingsCard}>
          <div className={style.layout}>
            {/* Боковое меню */}
            <nav className={style.sidebar}>
              {MENU_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'primary' : 'ghost'}
                  fullWidth
                  align="start"
                  className={style.menuButton}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={style.menuIcon}>{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Основной контент */}
            <main className={style.main}>{renderContent()}</main>
          </div>
        </SectionCard>
      </PageLayout>
    </ErrorBoundary>
  );
};
