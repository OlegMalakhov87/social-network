import { updatePostsPrivacyApi } from '../../../entities/post';
import { updateTracksPrivacyApi } from '../../../entities/track';
import { updateUserPrivacyApi } from '../../../entities/user';
import { updateVideosPrivacyApi } from '../../../entities/video';

export const PRIVACY_SETTINGS_CONFIG = [
  {
    key: 'profile',
    label: 'Настройка приватности вашего профиля',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateUserPrivacyApi,
  },
  {
    key: 'posts',
    label: 'Настройка приватности ваших постов',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updatePostsPrivacyApi,
  },
  {
    key: 'tracks',
    label: 'Настройка приватности ваших треков',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateTracksPrivacyApi,
  },
  {
    key: 'videos',
    label: 'Настройка приватности ваших видео',
    publicText: 'Все пользователи',
    privateText: 'Только я и мои друзья',
    updateFn: updateVideosPrivacyApi,
  },
];
