const THEME_STORAGE_KEY = 'theme';
const SYSTEM_THEME = 'system';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export const getStoredThemePreference = () =>
  localStorage.getItem(THEME_STORAGE_KEY) || SYSTEM_THEME;

export const resolveTheme = (themePreference, mediaQueryList) => {
  if (themePreference === SYSTEM_THEME) {
    return mediaQueryList.matches ? DARK_THEME : LIGHT_THEME;
  }

  return themePreference;
};

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

export { DARK_MEDIA_QUERY, SYSTEM_THEME, THEME_STORAGE_KEY };
