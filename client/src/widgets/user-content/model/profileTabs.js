import { PhotosTab, PostsTab, TracksTab, VideosTab } from '..';
import {
  getPhotosTabProps,
  getPostsTabProps,
  getTracksTabProps,
  getVideosTabProps,
} from '../../../entities/user';

/** Хранит вкладки профиля и функции подготовки их свойств. */
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

/** Содержит вкладки профиля для панели инструментов и поиска по идентификатору. */
export const PROFILE_TABS_MAP = Object.values(PROFILE_TABS);

/**
 * Возвращает содержимое активной вкладки профиля.
 *
 * @param {Object} params - Параметры вкладки
 * @param {string} [params.activeTab='posts'] - Идентификатор активной вкладки
 * @param {Object} [params.tabProps={}] - Свойства активной вкладки
 * @returns {JSX.Element|null} Разметка активной вкладки.
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
