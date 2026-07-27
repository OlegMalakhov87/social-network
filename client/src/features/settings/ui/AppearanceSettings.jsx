import { useEffect, useState } from 'react';
import { useNotify } from '../../../shared/hooks';
import { Button, Select, Text } from '../../../shared/ui';
import style from './SettingsForm.module.css';

const THEME_OPTIONS = [
  { value: 'light', label: '☀️ Светлая тема' },
  { value: 'dark', label: '🌙 Тёмная тема' },
  { value: 'system', label: '💻 Как в системе' },
];

export const AppearanceSettings = () => {
  const notify = useNotify();

  // Инициализация темы из localStorage или дефолтное значение 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Применение темы при изменении стейта или первой загрузке
  useEffect(() => {
    let appliedTheme = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      appliedTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', appliedTheme);
    localStorage.setItem('theme', theme);
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
