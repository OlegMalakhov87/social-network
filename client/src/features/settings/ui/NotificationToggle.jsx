import { useState } from 'react';
import { NOTIFICATION_SETTINGS_CONFIG } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Checkbox, Text } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек уведомлений.
 *
 */
export const NotificationToggle = () => {
  const notify = useNotify();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: true,
    friends: true,
    posts: false,
    digest: true,
  });

  /** Обработчик сохранения настроек уведомлений */
  const handleSave = () => {
    notify.success('Настройки уведомлений сохранены');
  };

  /** Обработчик переключения уведомлений */
  const toggle = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className={style.formWrapper}>
      <Text variant="h3" className={style.sectionTitle}>
        Уведомления
      </Text>

      <div className={style.toggleGroup}>
        {NOTIFICATION_SETTINGS_CONFIG.map((option) => (
          <Checkbox
            key={option.id}
            id={option.id}
            checked={notifications[option.id]}
            onChange={() => toggle(option.id)}
            label={
              <div className={style.checkboxLabelWrapper}>
                <Text variant="body1" className={style.checkboxTitle}>
                  {option.label}
                </Text>
                <Text variant="caption" className={style.checkboxDescription}>
                  {option.description}
                </Text>
              </div>
            }
          />
        ))}
      </div>

      <Button
        variant="primary"
        className={style.saveButton}
        onClick={handleSave}
      >
        Сохранить настройки
      </Button>
    </div>
  );
};
