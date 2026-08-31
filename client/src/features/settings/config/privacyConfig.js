import { updatePostsPrivacyApi } from '../../../entities/post';
import { updateTracksPrivacyApi } from '../../../entities/track';
import { updateUserPrivacyApi } from '../../../entities/user';
import { updateVideosPrivacyApi } from '../../../entities/video';

export const PRIVACY_SETTINGS_CONFIG = [
  {
    key: 'profile',
    label: 'Кто видит мой профиль *',
    description: 'Настройка приватности профиля',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateUserPrivacyApi,
  },
  {
    key: 'posts',
    label: 'Кто видит мои посты *',
    description: 'Настройка приватности постов',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updatePostsPrivacyApi,
  },
  {
    key: 'tracks',
    label: 'Кто видит мои треки *',
    description: 'Настройка приватности треков',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateTracksPrivacyApi,
  },
  {
    key: 'videos',
    label: 'Кто видит мои видео *',
    description: 'Настройка приватности видео',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateVideosPrivacyApi,
  },
];
