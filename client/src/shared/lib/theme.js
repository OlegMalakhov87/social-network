const THEME_STORAGE_KEY = 'theme';
const SYSTEM_THEME = 'system';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Возвращает сохранённое предпочтение темы.
 *
 * @returns {string} Сохранённая тема или системная тема.
 */
export const getStoredThemePreference = () =>
  localStorage.getItem(THEME_STORAGE_KEY) || SYSTEM_THEME;

/**
 * Выбирает тёмную или светлую тему по предпочтению и системной настройке.
 *
 * @param {string} themePreference - Предпочтение пользователя
 * @param {MediaQueryList} mediaQueryList - Системная цветовая схема
 * @returns {string} Имя применённой темы.
 */
const resolveTheme = (themePreference, mediaQueryList) => {
  if (themePreference === SYSTEM_THEME) {
    return mediaQueryList.matches ? DARK_THEME : LIGHT_THEME;
  }

  return themePreference;
};

/**
 * Применяет тему к документу и сохраняет предпочтение.
 *
 * @param {string} themePreference - Предпочтение пользователя
 * @param {MediaQueryList} [mediaQueryList=window.matchMedia('(prefers-color-scheme: dark)')] - Системная цветовая схема
 * @returns {string} Имя применённой темы.
 */
export const applyThemePreference = (
  themePreference,
  mediaQueryList = window.matchMedia(DARK_MEDIA_QUERY)
) => {
  const resolvedTheme = resolveTheme(themePreference, mediaQueryList);

  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.body?.setAttribute('data-theme', resolvedTheme);
  document.documentElement.style.colorScheme =
    resolvedTheme === DARK_THEME ? 'dark' : 'light';

  localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  return resolvedTheme;
};

export { DARK_MEDIA_QUERY, SYSTEM_THEME };
