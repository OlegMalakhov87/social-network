import {
  getPhotosTabProps,
  getPostsTabProps,
  getTracksTabProps,
  getVideosTabProps,
} from '..';
import {
  PhotosTab,
  PostsTab,
  TracksTab,
  VideosTab,
} from '../../../widgets/user-content';

/** Мапа для получения пропсов для выбранной вкладки */
export const PROFILE_TABS_MAP = [
  {
    id: 'posts',
    label: 'Посты',
    icon: '📝',
    Component: PostsTab,
    getProps: getPostsTabProps,
  },
  {
    id: 'photos',
    label: 'Фото',
    icon: '📷',
    Component: PhotosTab,
    getProps: getPhotosTabProps,
  },
  {
    id: 'tracks',
    label: 'Музыка',
    icon: '🎵',
    Component: TracksTab,
    getProps: getTracksTabProps,
  },
  {
    id: 'videos',
    label: 'Видео',
    icon: '🎬',
    Component: VideosTab,
    getProps: getVideosTabProps,
  },
];
