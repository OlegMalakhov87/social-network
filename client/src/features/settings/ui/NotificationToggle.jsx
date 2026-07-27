import { useState } from 'react';
import { NOTIFICATION_SETTINGS_CONFIG } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Checkbox, Text } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек уведомлений.
 *
 * @param {Object} props - пропсы компонента.
 * @param {Object} props.currentUser - текущий пользователь.
 * @returns {JSX.Element}
 */
export const NotificationToggle = ({ currentUser }) => {
  const notify = useNotify();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: true,
    friends: true,
    posts: false,
    digest: true,
  });

  const handleSave = () => {
    notify.success('Настройки уведомлений сохранены');
  };

  const toggle = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!currentUser) return null;

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
