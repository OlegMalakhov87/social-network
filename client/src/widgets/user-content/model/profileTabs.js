import { PhotosTab, PostsTab, TracksTab, VideosTab } from '..';
import {
  getPhotosTabProps,
  getPostsTabProps,
  getTracksTabProps,
  getVideosTabProps,
} from '../../../entities/user';

/** Мапа для получения пропсов для выбранной вкладки */
const PROFILE_TABS = {
  posts: {
    id: 'posts',
    label: 'Посты',
    icon: '📝',
    Component: PostsTab,
    getProps: getPostsTabProps,
  },
  photos: {
    id: 'photos',
    label: 'Фото',
    icon: '📷',
    Component: PhotosTab,
    getProps: getPhotosTabProps,
  },
  tracks: {
    id: 'tracks',
    label: 'Музыка',
    icon: '🎵',
    Component: TracksTab,
    getProps: getTracksTabProps,
  },
  videos: {
    id: 'videos',
    label: 'Видео',
    icon: '🎬',
    Component: VideosTab,
    getProps: getVideosTabProps,
  },
};

/** Массив вкладок для Toolbar и для поиска вкладки по id */
export const PROFILE_TABS_MAP = Object.values(PROFILE_TABS);

/**
 * Возвращает компонент активной вкладки профиля.
 *
 * @param {Object} params - пропсы
 * @param {string} params.activeTab - активная вкладка
 * @param {Object} params.tabProps - пропсы для вкладки
 * @returns {JSX.Element|null} - компонент активной вкладки
 */
export const getProfileTabContent = ({
  activeTab = 'posts',
  tabProps = {},
}) => {
  const tab = PROFILE_TABS[activeTab];
  if (!tab) return null;

  const { Component, getProps } = tab;
  return <Component {...getProps(tabProps)} />;
};
