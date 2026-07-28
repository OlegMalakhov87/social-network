import { useEffect, useState } from 'react';
import { THEME_OPTIONS } from '..';
import { useNotify } from '../../../shared/hooks';
import { Button, Select, Text } from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы настроек внешнего вида.
 */
export const AppearanceSettings = () => {
  const notify = useNotify();

  //Инициализация темы из localStorage или дефолтное значение 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Применение темы при изменении стейта или первой загрузке
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

  const handleSave = () => {
    notify.success('Настройки внешнего вида сохранены');
  };

  return (
    <div className={style.formWrapper}>
      <Text variant="h3" className={style.sectionTitle}>
        Внешний вид
      </Text>

      <div className={style.form}>
        <Select
          label="Цветовая схема"
          options={THEME_OPTIONS}
          value={theme}
          onChange={(value) => setTheme(value)}
        />

        <Text variant="body2" className={style.hintText}>
          Выбор темы автоматически применится ко всему приложению. Если выбрана
          опция "Как в системе", приложение будет следовать настройкам вашей ОС.
        </Text>

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
