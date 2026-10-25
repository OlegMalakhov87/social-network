import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectIsAuthReady, selectUser } from '../../../entities/auth';
import { useOptimisticCommentCount } from '../../../shared/hooks';
import { usePosts } from '../../posts';
import { useUserMusicLibrary } from '../../tracks';
import { useLibraryResource, useProfile } from '../../users';
import { useUserVideoLibrary } from '../../videos';

/**
 * Возвращает материалы профиля по активной вкладке.
 *
 * @param {Object} params - Параметры фильтра
 * @param {string} [params.activeTab='posts'] - Активная вкладка
 * @param {number|string|null} [params.userIdParam=null] - Идентификатор пользователя
 * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
 * @returns {{
 *   currentUser: Object|null,
 *   targetUser: Object|null,
 *   isOwnProfile: boolean,
 *   userError: { message: string, fieldErrors?: Object }|null,
 *   refetchUser: Function,
 *   followUser: Function,
 *   unfollowUser: Function,
 *   acceptUser: Function,
 *   blockUser: Function,
 *   unlockUser: Function|undefined,
 *   items: Array<Object>,
 *   isLoadingProfile: boolean,
 *   toggleLikeItem: Function,
 *   deleteFromLibrary: Function,
 *   addToLibrary: Function,
 *   incrementCounter: Function,
 *   toggleFavoriteItem: Function,
 *   updateCommentsCount: Function,
 *   isLoadingPosts: boolean|undefined,
 *   isLoadingMorePosts: boolean,
 *   errorPosts: { message: string, fieldErrors?: Object }|null,
 *   addPost: Function,
 *   updatePost: Function,
 *   deletePost: Function,
 *   refetchPosts: Function,
 *   hasMorePosts: boolean,
 *   loadMorePosts: Function,
 *   isLoadingTracks: boolean|undefined,
 *   isLoadingMoreTracks: boolean,
 *   errorTracks: { message: string, fieldErrors?: Object }|null,
 *   refetchTracks: Function,
 *   hasMoreTracks: boolean,
 *   loadMoreTracks: Function,
 *   isLoadingVideos: boolean|undefined,
 *   isLoadingMoreVideos: boolean,
 *   errorVideos: { message: string, fieldErrors?: Object }|null,
 *   refetchVideos: Function,
 *   hasMoreVideos: boolean,
 *   loadMoreVideos: Function
 * }} Материалы профиля и действия
 */
export const useContentFilter = ({
  activeTab = 'posts',
  userIdParam = null,
  sortKey = 'dateDesc',
}) => {
  const currentUser = useSelector(selectUser);
  const isAuthReady = useSelector(selectIsAuthReady);

  const profileUserId = useMemo(() => {
    if (userIdParam) {
      const id = Number(userIdParam);
      return Number.isInteger(id) && id > 0 ? id : null;
    }
    return isAuthReady ? (currentUser?.id ?? null) : null;
  }, [userIdParam, currentUser?.id, isAuthReady]);

  const isOwnProfile = !profileUserId || profileUserId === currentUser?.id;

  const {
    user: targetUser,
    userLoading,
    userError,
    refetchUser,
    followUser,
    unfollowUser,
    acceptUser,
    blockUser,
    unlockUser,
  } = useProfile(profileUserId);

  // Ограничивает загрузку активной вкладкой.
  const fetchMap = {
    posts: { posts: true },
    photos: { posts: true },
    tracks: { tracks: true },
    videos: { videos: true },
  };
  const config = fetchMap[activeTab] ?? {};

  const {
    posts: apiPosts,
    hasMore: hasMorePosts,
    isLoading: isLoadingPostsApi,
    loadMore: loadMorePosts,
    isLoadingMore: isLoadingMorePosts,
    error: errorPosts,
    refetch: refetchPosts,
    addPost,
    updatePost,
    deletePost,
    setPostsItems,
  } = usePosts({
    profileUserId: config.posts ? targetUser?.id : null,
    currentUserId: currentUser?.id,
    isOwnProfile,
    sortKey,
  });

  const {
    tracks: apiTracks,
    hasMore: hasMoreTracks,
    isLoading: isLoadingTracksApi,
    loadMore: loadMoreTracks,
    isLoadingMore: isLoadingMoreTracks,
    error: errorTracks,
    refetch: refetchTracks,
    setTracksItems,
  } = useUserMusicLibrary({
    profileUserId: config.tracks ? targetUser?.id : null,
    currentUserId: currentUser?.id,
    isOwnProfile,
    sortKey,
  });

  const {
    videos: apiVideos,
    hasMore: hasMoreVideos,
    isLoading: isLoadingVideosApi,
    loadMore: loadMoreVideos,
    isLoadingMore: isLoadingMoreVideos,
    error: errorVideos,
    refetch: refetchVideos,
    setVideosItems,
  } = useUserVideoLibrary({
    profileUserId: config.videos ? targetUser?.id : null,
    currentUserId: currentUser?.id,
    isOwnProfile,
    sortKey,
  });

  const trackAddTransform = useCallback(
    () => ({
      playsCount: 0,
      libraryCreatedAt: new Date().toISOString(),
      isFavorite: false,
      isInLibrary: true,
    }),
    []
  );
  const trackRemoveTransform = useCallback(
    () => ({
      playsCount: 0,
      libraryCreatedAt: null,
      isFavorite: false,
      isInLibrary: false,
      libraryId: null,
    }),
    []
  );

  const videoAddTransform = useCallback(
    () => ({
      viewsCount: 0,
      libraryCreatedAt: new Date().toISOString(),
      lastWatchedAt: null,
      isFavorite: false,
      isInLibrary: true,
    }),
    []
  );
  const videoRemoveTransform = useCallback(
    () => ({
      viewsCount: 0,
      lastWatchedAt: null,
      libraryCreatedAt: null,
      isFavorite: false,
      isInLibrary: false,
      libraryId: null,
    }),
    []
  );

  const setCurrentItems = useMemo(() => {
    switch (activeTab) {
      case 'posts':
        return setPostsItems;
      case 'photos':
        return setPostsItems;
      case 'tracks':
        return setTracksItems;
      case 'videos':
        return setVideosItems;
      default:
        return null;
    }
  }, [activeTab, setPostsItems, setTracksItems, setVideosItems]);

  // Ограничивает библиотеку вкладками музыки и видео.
  const isTracks = activeTab === 'tracks';
  const isVideos = activeTab === 'videos';
  const currentTab = isTracks ? 'tracks' : isVideos ? 'videos' : null;

  const userLibrary = useLibraryResource({
    items: currentTab ? (isTracks ? apiTracks : apiVideos) : [],
    userId: currentUser?.id,
    isOwnProfile,
    setItems: setCurrentItems,
    isTracks,
    isVideos,
    currentTab,
    activeTab,
    getAddStateTransform: currentTab
      ? isTracks
        ? trackAddTransform
        : videoAddTransform
      : null,
    getRemoveStateTransform: currentTab
      ? isTracks
        ? trackRemoveTransform
        : videoRemoveTransform
      : null,
  });

  const updateCommentsCount = useOptimisticCommentCount(setCurrentItems);

  const filteredItems = useMemo(() => {
    if (!targetUser?.id) return [];

    switch (activeTab) {
      case 'posts':
        return apiPosts || [];
      case 'photos':
        // Оставляет посты с изображением для вкладки фото.
        return (apiPosts || []).filter((post) => post.type === 'image');
      case 'tracks':
        // Подменяет дату загрузки датой добавления в библиотеку.
        return (apiTracks || []).map((track) => ({
          ...track,
          createdAt: track.libraryCreatedAt || track.createdAt,
        }));
      case 'videos':
        // Подменяет дату загрузки датой добавления в библиотеку.
        return (apiVideos || []).map((video) => ({
          ...video,
          createdAt: video.libraryCreatedAt || video.createdAt,
        }));

      default:
        return [];
    }
  }, [activeTab, targetUser?.id, apiPosts, apiTracks, apiVideos]);

  return {
    currentUser,
    targetUser,
    isOwnProfile,
    userError,
    refetchUser,
    followUser,
    unfollowUser,
    acceptUser,
    blockUser,
    unlockUser,
    items: filteredItems,
    isLoadingProfile:
      (userLoading && !isOwnProfile) || (!isAuthReady && isOwnProfile),

    toggleLikeItem: userLibrary?.toggleLikeItem,
    deleteFromLibrary: userLibrary?.deleteFromLibrary,
    addToLibrary: userLibrary?.addToLibrary,
    incrementCounter: userLibrary?.incrementCounter,
    toggleFavoriteItem: userLibrary?.toggleFavoriteItem,
    updateCommentsCount,

    isLoadingPosts: config.posts && isLoadingPostsApi,
    isLoadingMorePosts,
    errorPosts,
    addPost,
    updatePost,
    deletePost,
    refetchPosts,
    hasMorePosts,
    loadMorePosts,

    isLoadingTracks: config.tracks && isLoadingTracksApi,
    isLoadingMoreTracks,
    errorTracks,
    refetchTracks,
    hasMoreTracks,
    loadMoreTracks,

    isLoadingVideos: config.videos && isLoadingVideosApi,
    isLoadingMoreVideos,
    errorVideos,
    refetchVideos,
    hasMoreVideos,
    loadMoreVideos,
  };
};
