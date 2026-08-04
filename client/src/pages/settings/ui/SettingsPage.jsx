import { useState } from 'react';
import { useSelector } from 'react-redux';
import { SettingsNav } from '..';
import { selectUser } from '../../../entities/auth';
import {
  AppearanceSettings,
  ChangePasswordForm,
  EditProfileForm,
  NotificationToggle,
  PrivacySettings,
  SETTINGS_TABS_MAP,
} from '../../../features/settings';
import {
  ErrorBoundary,
  PageLayout,
  PageLoader,
  SectionCard,
  Text,
} from '../../../shared/ui';
import style from './SettingsPage.module.css';

/**
 * Компонент страницы настроек.
 */

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const currentUser = useSelector(selectUser);

  /**  Состояние загрузки всей страницы */
  if (!currentUser) {
    return <PageLoader message="Загружаем страницу настроек..." />;
  }

  /** Рендерит контент в зависимости от активной вкладки */
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EditProfileForm currentUser={currentUser} />;
      case 'account':
        return <ChangePasswordForm />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationToggle />;
      case 'privacy':
        return <PrivacySettings />;
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
            <aside className={style.sidebar}>
              <SettingsNav
                items={SETTINGS_TABS_MAP}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </aside>

            <div className={style.content}>{renderContent()}</div>
          </div>
        </SectionCard>
      </PageLayout>
    </ErrorBoundary>
  );
};
