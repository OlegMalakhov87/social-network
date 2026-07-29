import { useEffect, useState } from 'react';
import { THEME_OPTIONS } from '..';
import { Alert, SegmentedControl } from '../../../shared/ui';
import style from './SettingsForm.module.css';
import { SettingsSection } from './SettingsSection';

/**
 * Компонент формы настроек внешнего вида.
 */
export const AppearanceSettings = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let appliedTheme = theme;
      if (theme === 'system') {
        appliedTheme = mediaQuery.matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', appliedTheme);
      localStorage.setItem('theme', theme);
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
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
          опция «Система», приложение будет следовать настройкам вашей ОС.
        </Alert>
      </div>
    </SettingsSection>
  );
};
