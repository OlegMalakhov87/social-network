import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthReady, selectUser } from '../../../entities/auth';
import { useOptimisticCommentCount } from '../../../shared/hooks';
import { useUserPosts } from '../../posts';
import { useUserMusicLibrary } from '../../tracks';
import { useLibraryResource, useUserProfile } from '../../users';
import { useUserVideoLibrary } from '../../videos';

/**
 * Хук для фильтрации и сортировки контента пользователя по вкладкам
 *
 * @param {Object} params
 * @param {string} [params.activeTab] - тип контента для отображения
 * @param {number|string} [params.userIdParam] - ID пользователя из URL
 * @param {string} [params.sortKey] - ключ сортировки из SORT_OPTIONS
 * @returns {Object} - объект с данными о контенте пользователя
 */
export const useUserContentFilter = ({
  activeTab = 'posts',
  userIdParam = null,
  sortKey = 'dateDesc',
}) => {
  const currentUser = useSelector(selectUser);
  const isAuthReady = useSelector(selectIsAuthReady);

  /**
   * Получение ID пользователя и приводим к правильному типу
   */
  const profileUserId = useMemo(() => {
    if (userIdParam) {
      const id = Number(userIdParam);
      return Number.isInteger(id) && id > 0 ? id : null;
    }
    return isAuthReady ? (currentUser?.id ?? null) : null;
  }, [userIdParam, currentUser?.id, isAuthReady]);

  /**
   * Получаем целевого пользователя с сервера
   */
  const {
    user: apiUser,
    userLoading,
    userError,
    refetchUser,
    followUser,
    unfollowUser,
    acceptUser,
    blockUser,
    unlockUser,
  } = useUserProfile(profileUserId);

  //Проверяем, является ли текущий пользователь владельцем профиля
  const isOwnProfile = !profileUserId || profileUserId === currentUser?.id;

  // Целевой пользователь
  const targetUser = isOwnProfile ? currentUser : apiUser;

  /**
   * Маппинг для определения, нужно ли загружать контент
   */
  const fetchMap = {
    posts: { posts: true },
    photos: { posts: true },
    tracks: { tracks: true },
    videos: { videos: true },
  };
  const config = fetchMap[activeTab] ?? {};

  /**
   * Загружаем посты пользователя только когда активна вкладка Post или Photo
   */

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
  } = useUserPosts({
    profileUserId: config.posts ? targetUser?.id : null,
    currentUserId: currentUser?.id,
    isOwnProfile,
    sortKey,
  });

  /**
   * Загружаем треки пользователя только когда активна вкладка Music
   */

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

  /**
   * Загружаем видео пользователя только когда активна вкладка Video
   */

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

  /** Трансформации для работы с библиотеками */
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

  /** Маппинг для определения, какой setItems нужно использовать */
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

  /** Маппинг для определения, какой контент нужно загружать для работы с библиотекой пользователя, используем только tracks или videos*/
  const isTracks = activeTab === 'tracks';
  const isVideos = activeTab === 'videos';
  const currentTab = isTracks ? 'tracks' : isVideos ? 'videos' : null;

  /**
   * Хук для управления библиотекой пользователя
   */
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

  /** Хук для управления количеством комментариев */
  const updateCommentCount = useOptimisticCommentCount(setCurrentItems);

  /**
   * Фильтрация по типу контента и пользователю
   */
  const filteredItems = useMemo(() => {
    if (!targetUser?.id) return [];

    switch (activeTab) {
      case 'posts':
        return apiPosts || [];
      case 'photos':
        //Фильтруем посты с типом image для вкладки фото
        return (apiPosts || []).filter((post) => post.type === 'image');
      case 'tracks':
        // Для профиля подменяем дату загрузки на дату добавления в библиотеку
        return (apiTracks || []).map((track) => ({
          ...track,
          createdAt: track.libraryCreatedAt || track.createdAt,
        }));
      case 'videos':
        // Для профиля подменяем дату загрузки на дату добавления в библиотеку
        return (apiVideos || []).map((video) => ({
          ...video,
          createdAt: video.libraryCreatedAt || video.createdAt,
        }));

      default:
        return [];
    }
  }, [activeTab, targetUser?.id, apiPosts, apiTracks, apiVideos]);

  /**
   * Возвращаем объект с данными о контенте пользователя
   */
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

    // Экшены из userLibrary
    toggleLikeItem: userLibrary?.toggleLikeItem,
    deleteFromLibrary: userLibrary?.deleteFromLibrary,
    addToLibrary: userLibrary?.addToLibrary,
    incrementCounter: userLibrary?.incrementCounter,
    toggleFavoriteItem: userLibrary?.toggleFavoriteItem,
    updateCommentCount,

    // Посты
    isLoadingPosts: config.posts && isLoadingPostsApi,
    isLoadingMorePosts,
    errorPosts,
    addPost,
    updatePost,
    deletePost,
    refetchPosts,
    hasMorePosts,
    loadMorePosts,

    // Треки
    isLoadingTracks: config.tracks && isLoadingTracksApi,
    isLoadingMoreTracks,
    errorTracks,
    refetchTracks,
    hasMoreTracks,
    loadMoreTracks,

    // Видео
    isLoadingVideos: config.videos && isLoadingVideosApi,
    isLoadingMoreVideos,
    errorVideos,
    refetchVideos,
    hasMoreVideos,
    loadMoreVideos,
  };
};
