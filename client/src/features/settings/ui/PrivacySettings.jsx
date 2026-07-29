import { useRef, useState } from 'react';
import { PRIVACY_SETTINGS_CONFIG } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Select } from '../../../shared/ui';
import { SettingsSection } from './SettingsSection';
import style from './SettingsForm.module.css';

const DEFAULT_PRIVACY = {
  profile: true,
  posts: true,
  tracks: true,
  videos: true,
};

/**
 * Компонент формы настроек приватности.
 *
 */
export const PrivacySettings = ({currentUser}) => {
  const notify = useNotify();
  const [savingKeys, setSavingKeys] = useState(new Set());
  const [privacy, setPrivacy] = useState(DEFAULT_PRIVACY);
  const lastSavedRef = useRef({ ...DEFAULT_PRIVACY });

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (setting) => {
    const { key, updateFn } = setting;
    const value = privacy[key];
    const rollbackValue = lastSavedRef.current[key];

    if (value === rollbackValue) {
      notify.info('Сохраненные настройки уже установлены');
      return;
    }

    setSavingKeys((prev) => new Set(prev).add(key));

    try {
      await updateFn(value);
      lastSavedRef.current[key] = value;
      notify.success(`Настройки для ${setting.label} сохранены`);
    } catch (error) {
      notify.error(error?.message || 'Ошибка сохранения');
      setPrivacy((prev) => ({ ...prev, [key]: rollbackValue }));
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <SettingsSection title="Приватность">
      <div className={style.form}>
        {PRIVACY_SETTINGS_CONFIG.map((setting) => (
          <div key={setting.key} className={style.settingItem}>
            <div className={style.settingItemField}>
              <Select
                label={setting.label}
                options={setting.options}
                value={privacy[setting.key]}
                onChange={(value) => handlePrivacyChange(setting.key, value)}
                disabled={savingKeys.has(setting.key)}
              />
            </div>
            <Button
              variant="primary"
              className={style.settingItemSave}
              onClick={() => handleSave(setting)}
              disabled={savingKeys.has(setting.key)}
              loading={savingKeys.has(setting.key)}
            >
              Сохранить настройки
            </Button>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};
