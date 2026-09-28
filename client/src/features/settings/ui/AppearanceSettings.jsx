import { useEffect, useState } from 'react';
import { SettingsSection, THEME_OPTIONS } from '..';
import { applyThemePreference, getStoredThemePreference } from '../../../shared/lib';
import { Alert, SegmentedControl } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек внешнего вида.
 */
export const AppearanceSettings = () => {
  const [theme, setTheme] = useState(() => getStoredThemePreference());

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  return (
    <SettingsSection title="Внешний вид">
      <div className={style.form}>
        <div>
          <span className={style.fieldLabel}>Цветовая схема</span>
          <SegmentedControl
            options={THEME_OPTIONS}
            value={theme}
            onChange={setTheme}
          />
        </div>

        <Alert variant="info" title="Подсказка">
          Выбор темы автоматически применится ко всему приложению. Если выбрана
          опция «Система», приложение будет следовать настройкам вашего
          браузера.
        </Alert>
      </div>
    </SettingsSection>
  );
};
