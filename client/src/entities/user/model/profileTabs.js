import {
  PostsTab,
  PhotosTab,
  TracksTab,
  VideosTab,
} from '../../../widgets/user-content';

/**  Категории вкладок на странице профиля (должны совпадать с ключами activeTab) */
export const PROFILE_TABS = [
  {
    id: 'posts',
    label: 'Посты',
    icon: '📝',
    Component: PostsTab,
  },
  {
    id: 'photos',
    label: 'Фото',
    icon: '📷',
    Component: PhotosTab,
  },
  {
    id: 'tracks',
    label: 'Музыка',
    icon: '🎵',
    Component: TracksTab,
  },
  {
    id: 'videos',
    label: 'Видео',
    icon: '🎬',
    Component: VideosTab,
  },
];
