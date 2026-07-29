import { updatePostsPrivacyApi } from '../../../entities/post';
import { updateTracksPrivacyApi } from '../../../entities/track';
import { updateUserPrivacyApi } from '../../../entities/user';
import { updateVideosPrivacyApi } from '../../../entities/video';

/**
 * Опции видимости для полей приватности.
 */
export const VISIBILITY_OPTIONS = [
  { value: true, label: 'Публичный' },
  { value: false, label: 'Приватный' },
];

/**
 * Конфигурация полей приватности для маппинга в UI.
 */
export const PRIVACY_SETTINGS_CONFIG = [
  {
    key: 'profile',
    label: 'Кто видит мой профиль',
    options: VISIBILITY_OPTIONS,
    updateFn: updateUserPrivacyApi,
  },
  {
    key: 'posts',
    label: 'Кто видит мои посты',
    options: VISIBILITY_OPTIONS,
    updateFn: updatePostsPrivacyApi,
  },
  {
    key: 'tracks',
    label: 'Кто видит мои треки',
    options: VISIBILITY_OPTIONS,
    updateFn: updateTracksPrivacyApi,
  },
  {
    key: 'videos',
    label: 'Кто видит мои видео',
    options: VISIBILITY_OPTIONS,
    updateFn: updateVideosPrivacyApi,
  },
];
