import { useState } from 'react';
import { PRIVACY_SETTINGS_CONFIG } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Select, Text } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек приватности.
 *
 * @param {Object} props - пропсы компонента.
 * @param {Object} props.currentUser - текущий пользователь.
 * @returns {JSX.Element}
 */
export const PrivacySettings = () => {
  const notify = useNotify();
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    postsVisibility: 'public',
    isTracksPublic: 'true',
    isVideosPublic: 'true',
  });

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = { ...privacy };
    PRIVACY_SETTINGS_CONFIG.forEach((setting) => {
      if (setting.isBoolean) {
        payload[setting.key] = payload[setting.key] === 'true';
      }
    });
    console.log('Отправка на сервер:', payload);
    notify.success('Настройки приватности сохранены');
  };

  return (
    <div className={style.formWrapper}>
      <Text variant="h3" className={style.sectionTitle}>
        Приватность
      </Text>

      <div className={style.form}>
        {PRIVACY_SETTINGS_CONFIG.map((setting) => (
          <Select
            key={setting.key}
            label={setting.label}
            options={setting.options}
            value={privacy[setting.key]}
            onChange={(value) => handlePrivacyChange(setting.key, value)}
          />
        ))}

        <Button
          variant="primary"
          className={style.saveButton}
          onClick={handleSave}
        >
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
};
