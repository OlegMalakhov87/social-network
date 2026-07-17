import { useMemo } from 'react';
import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import {
  addTrackToLibrary,
  deleteTrackFromLibrary,
} from '../../../entities/track';
import {
  addVideoToLibrary,
  deleteVideoFromLibrary,
} from '../../../entities/video ';
import { useUserPosts } from '../../posts';
import { useUserMusicLibrary } from '../../tracks';
import { useLibraryResource, useUserProfile } from '../../users';
import { useUserVideoLibrary } from '../../videos';

/**
 * Хук для фильтрации и сортировки контента пользователя по вкладкам
 * @param {Object} params - параметры фильтрации
 * @param {'posts'|'photos'|'tracks'|'videos'} [params.activeTab] - тип контента для отображения
 * @param {number} [params.userIdParam] - ID пользователя, чей контент показываем
 * @param {string} [params.sortKey] - ключ сортировки из SORT_OPTIONS
 */
export const useUserContentFilter = ({ activeTab, userIdParam, sortKey }) => {
  const currentUser = selectUser();

  /**
   * Получение ID пользователя и приводим к правильному типу
   * @returns {number|null} ID пользователя
   */
  const profileUserId = useMemo(() => {
    if (userIdParam) {
      const id = Number(userIdParam);
      return Number.isInteger(id) && id > 0 ? id : null;
    }
    return currentUser?.id ?? null;
  }, [userIdParam, currentUser?.id]);

  /**
   * Проверяем, является ли текущий пользователь владельцем профиля
   * @returns {boolean} true, если текущий пользователь владельцем профиля
   */
  const isOwnProfile = !profileUserId || profileUserId === currentUser?.id;

  /**
   * Получаем целевого пользователя с сервера
   * @returns {Object|null} данные пользователя
   */
  const {
    user: apiUser,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUserProfile(profileUserId);

  /**
   * Получаем целевого пользователя
   * @returns {Object|null} данные пользователя
   */
  const targetUser = isOwnProfile ? currentUser : apiUser;

  /**
   * Маппинг для определения, нужно ли загружать контент
   * @returns {Object} маппинг для определения, нужно ли загружать контент
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
   * @returns {Object} данные о постах пользователя
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
  } = useUserPosts(
    config.posts ? targetUser?.id : null,
    currentUser?.id,
    sortKey
  );

  /**
   * Загружаем треки пользователя только когда активна вкладка Music
   * @returns {Object} данные о треках пользователя
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
  } = useUserMusicLibrary(
    config.tracks ? targetUser?.id : null,
    currentUser?.id,
    isOwnProfile,
    sortKey
  );

  /**
   * Загружаем видео пользователя только когда активна вкладка Video
   * @returns {Object} данные о видео пользователя
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
  } = useUserVideoLibrary(
    config.videos ? targetUser?.id : null,
    currentUser?.id,
    isOwnProfile,
    sortKey
  );

  /**
   * Получение функции для обновления setItems в зависимости от типа контента
   */
  const setItems = useMemo(() => {
    const map = {
      videos: setVideosItems,
      tracks: setTracksItems,
      posts: setPostsItems,
      photos: setPostsItems,
    };
    return map[activeTab];
  }, [activeTab, setVideosItems, setTracksItems, setPostsItems]);

  /** Определяем правила трансформации для ТЕКУЩЕЙ активной вкладки */
  const trackAddTransform = () => ({
    playCount: 0,
    libraryCreatedAt: new Date().toISOString(),
    isFavorite: false,
  });
  const trackRemoveTransform = () => ({
    playCount: 0,
    libraryCreatedAt: null,
    isFavorite: false,
  });

  const videoAddTransform = () => ({
    viewCount: 0,
    lastWatchedAt: new Date().toISOString(),
    libraryCreatedAt: new Date().toISOString(),
    isFavorite: false,
  });
  const videoRemoveTransform = () => ({
    viewCount: 0,
    lastWatchedAt: null,
    libraryCreatedAt: null,
    isFavorite: false,
  });

  const isVideo = activeTab === 'videos';
  /**
   * Получаем данные о библиотеке пользователя
   * @returns {Object} данные о библиотеке пользователя
   */
  const {
    toggleLikeItem,
    deleteItemOptimistic,
    addItemOptimistic,
    incrementCounter,
    toggleFavoriteItem,
    updateCommentCount,
  } = useLibraryResource({
    items: isVideo ? apiVideos : apiTracks,
    userId: currentUser?.id,
    isOwnProfile,
    addFn: isVideo ? addVideoToLibrary : addTrackToLibrary,
    removeFn: isVideo ? deleteVideoFromLibrary : deleteTrackFromLibrary,
    getAddStateTransform: isVideo ? videoAddTransform : trackAddTransform,
    getRemoveStateTransform: isVideo
      ? videoRemoveTransform
      : trackRemoveTransform,
    refetch: isVideo ? refetchVideos : refetchTracks,
    setItems,
    activeTab,
  });

  /**
   * Фильтрация по типу контента и пользователю
   * @returns {Array.<Object>} отфильтрованный и отсортированный массив сущностей (посты/фото/треки/видео)
   */
  const filteredItems = useMemo(() => {
    if (!targetUser?.id) return [];

    switch (activeTab) {
      case 'posts':
        return apiPosts || [];
      case 'photos':
        //Фильтруем посты с типом image для вкладки фото
        return (apiPosts || []).filter((post) => post.postType === 'image');
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
   * Флаги загрузки профиля/постов/треков/видео
   * @returns {boolean} true, если загрузка профиля/постов/треков/видео
   */
  const isLoadingProfile = (userLoading && !isOwnProfile) || !currentUser;
  const isLoadingPosts = config.posts && isLoadingPostsApi;
  const isLoadingTracks = config.tracks && isLoadingTracksApi;
  const isLoadingVideos = config.videos && isLoadingVideosApi;

  /**
   * Возвращаем объект с данными о контенте пользователя
   * @returns {Object} объект с данными о контенте пользователя
   */
  return {
    currentUser,
    targetUser,
    isOwnProfile,
    userError,
    refetchUser,
    items: filteredItems,
    isLoadingProfile,
    toggleLikeItem,
    deleteItemOptimistic,
    addItemOptimistic,
    incrementCounter,
    toggleFavoriteItem,
    updateCommentCount,
    // Посты
    isLoadingPosts,
    isLoadingMorePosts,
    errorPosts,
    addPost,
    updatePost,
    deletePost,
    refetchPosts,
    hasMorePosts,
    loadMorePosts,
    // Треки
    isLoadingTracks,
    isLoadingMoreTracks,
    errorTracks,
    refetchTracks,
    hasMoreTracks,
    loadMoreTracks,
    // Видео
    isLoadingVideos,
    isLoadingMoreVideos,
    errorVideos,
    refetchVideos,
    hasMoreVideos,
    loadMoreVideos,
  };
};
