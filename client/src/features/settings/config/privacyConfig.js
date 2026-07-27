/**
 * Опции видимости для профиля и постов.
 */
export const VISIBILITY_OPTIONS_EXTENDED = [
  { value: 'public', label: 'Публичный (все)' },
  { value: 'friends', label: 'Только друзья' },
  { value: 'private', label: 'Только я' },
];

/**
 * Опции видимости для медиа (треки, видео).
 */
export const VISIBILITY_OPTIONS_MEDIA = [
  { value: 'true', label: 'Публичный' },
  { value: 'false', label: 'Приватный (только я)' },
];

/**
 * Конфигурация полей приватности для маппинга в UI.
 */
export const PRIVACY_SETTINGS_CONFIG = [
  {
    key: 'profileVisibility',
    label: 'Кто видит мой профиль',
    options: VISIBILITY_OPTIONS_EXTENDED,
    isBoolean: false,
  },
  {
    key: 'postsVisibility',
    label: 'Кто видит мои посты',
    options: VISIBILITY_OPTIONS_EXTENDED,
    isBoolean: false,
  },
  {
    key: 'isTracksPublic',
    label: 'Кто видит мои треки',
    options: VISIBILITY_OPTIONS_MEDIA,
    isBoolean: true, 
  },
  {
    key: 'isVideosPublic',
    label: 'Кто видит мои видео',
    options: VISIBILITY_OPTIONS_MEDIA,
    isBoolean: true,
  },
];
