import { useState } from 'react';
import { NOTIFICATION_SETTINGS_CONFIG, SettingsSection } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Checkbox } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек уведомлений.
 */
export const NotificationToggle = () => {
  const notify = useNotify();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: true,
    friends: true,
    posts: true,
    digest: true,
  });

  const handleSave = () => {
    notify.success('Настройки уведомлений сохранены');
  };

  const toggle = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <SettingsSection title="Уведомления">
      <div className={style.toggleGroup}>
        {NOTIFICATION_SETTINGS_CONFIG.map((option) => (
          <Checkbox
            id={option.key}
            label={option.label}
            description={option.description}
            align="start"
            checked={notifications[option.key]}
            onChange={() => toggle(option.key)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        className={style.formFooter}
        onClick={handleSave}
      >
        Сохранить настройки
      </Button>
    </SettingsSection>
  );
};
