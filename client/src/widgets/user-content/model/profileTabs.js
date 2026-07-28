import {
  PhotosTab,
  PostsTab,
  TracksTab,
  VideosTab,
} from '..';
import {
  getPhotosTabProps,
  getPostsTabProps,
  getTracksTabProps,
  getVideosTabProps,
} from '../../../entities/user';

/** Мапа для получения пропсов для выбранной вкладки */
export const PROFILE_TABS_MAP = {
  posts: {
    label: 'Посты',
    icon: '📝',
    Component: PostsTab,
    getProps: getPostsTabProps,
  },
  photos: {
    label: 'Фото',
    icon: '📷',
    Component: PhotosTab,
    getProps: getPhotosTabProps,
  },
  tracks: {
    label: 'Музыка',
    icon: '🎵',
    Component: TracksTab,
    getProps: getTracksTabProps,
  },
  videos: {
    label: 'Видео',
    icon: '🎬',
    Component: VideosTab,
    getProps: getVideosTabProps,
  },
};

/**
 * Возвращает компонент активной вкладки профиля.
 *
 * @param {string} activeTab - активная вкладка
 * @param {Object} tabProps - пропсы для вкладки
 * @returns {JSX.Element|null} - компонент активной вкладки
 */
export const getProfileTabContent = (activeTab, tabProps) => {
  const tab = PROFILE_TABS_MAP[activeTab];
  if (!tab) return null;

  const { Component, getProps } = tab;
  return <Component {...getProps(tabProps)} />;
};