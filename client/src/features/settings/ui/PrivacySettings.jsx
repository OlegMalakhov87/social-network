import { useRef, useState } from 'react';

import { PRIVACY_SETTINGS_CONFIG, SettingsSection } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Checkbox } from '../../../shared/ui';

import style from './SettingsForm.module.css';

/**
 * Отображает настройки приватности.
 *
 * @returns {JSX.Element} Настройки приватности
 */
export const PrivacySettings = () => {
  const notify = useNotify();
  const [savingKeys, setSavingKeys] = useState(new Set());
  const [privacy, setPrivacy] = useState({
    profile: true,
    posts: true,
    tracks: true,
    videos: true,
  });
  const lastSavedRef = useRef({ ...privacy });

  /**
   * Переключает локальное значение настройки.
   *
   * @param {string} key - Ключ настройки
   * @returns {void}
   */
  const handleToggle = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Сохраняет настройку и возвращает прежнее значение при ошибке.
   *
   * @param {Object} setting - Настройка приватности
   * @param {string} setting.key - Ключ настройки
   * @param {Function} setting.updateFn - Отправляет значение на сервер
   * @returns {Promise<void>}
   */
  const handleSave = async (setting) => {
    const { key, updateFn } = setting;
    const value = privacy[key];
    const rollbackValue = lastSavedRef.current[key];

    setSavingKeys((prev) => new Set(prev).add(key));

    try {
      await updateFn(value);
      lastSavedRef.current[key] = value;
      notify.success('Настройки успешно сохранены');
    } catch (error) {
      notify.error('Ошибка сохранения');
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
      <div className={style.toggleGroup}>
        {PRIVACY_SETTINGS_CONFIG.map((setting) => (
          <Checkbox
            key={setting.key}
            id={setting.key}
            label={setting.label}
            description={
              privacy[setting.key] ? setting.publicText : setting.privateText
            }
            align="end"
            checked={privacy[setting.key]}
            onChange={() => handleToggle(setting.key)}
            disabled={savingKeys.has(setting.key)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        className={style.formFooter}
        onClick={() => PRIVACY_SETTINGS_CONFIG.forEach(handleSave)}
      >
        Сохранить настройки
      </Button>
    </SettingsSection>
  );
};
