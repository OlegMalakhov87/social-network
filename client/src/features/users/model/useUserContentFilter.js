import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useUserProfile } from '../../users';
import { useUserPosts } from '../../posts';
import { useUserMusicLibrary } from '../../tracks';
import { useUserVideoLibrary } from '../../videos';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для фильтрации и сортировки контента пользователя
 * @param {Object} params - Параметры фильтрации
 * @param {'Posts'|'Photos'|'Tracks'|'Videos'} [params.activeTab] - Тип контента для отображения
 * @param {number} [params.userIdParam] - ID пользователя, чей контент показываем
 * @param {string} [params.sortKey] - Ключ сортировки из SORT_OPTIONS ('dateDesc', 'viewsDesc', ...)
 * @returns {{
 *   items: Array.<Object>,
 *   isLoading: boolean,
 *   currentUser: Object|null,
 *   targetUser: Object|null
 * }}
 * @property {Array.<Object>} items - Отфильтрованный и отсортированный массив сущностей (посты/треки/видео)
 * @property {boolean} isLoading - Флаг загрузки (true, пока не определён currentUser)
 * @property {Object|null} currentUser - Данные авторизованного пользователя
 * @property {Object|null} targetUser - Данные пользователя, чей профиль просматриваем (совпадает с currentUser, если это свой профиль)
 */

export const useUserContentFilter = ({ activeTab, userIdParam, sortKey }) => {
  const currentUser = useSelector((state) => state.auth?.user);

  // Получаем ID пользователя и приводим к правильному типу
  const profileUserId = useMemo(() => {
    if (userIdParam) {
      const id = Number(userIdParam);
      return Number.isInteger(id) && id > 0 ? id : null;
    }
    return currentUser?.id ?? null;
  }, [userIdParam, currentUser?.id]);

  const isOwnProfile = !profileUserId || profileUserId === currentUser?.id;

  // Получаем целевого пользователя с сервера
  const {
    user: apiUser,
    isLoading: isUserLoading,
    error: userError,
  } = useUserProfile(profileUserId);

  const targetUser = isOwnProfile ? currentUser : apiUser;

  // Загружаем посты пользователя только когда активна вкладка Post или Photo
  const shouldFetchPosts = activeTab === 'Post' || activeTab === 'Photo';
  const {
    posts: apiPosts,
    toggleLikePost,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    updateCommentCount: updateCommentCountPost,
    pagination: paginationPosts,
    isLoading: postsLoading,
    refetch: refetchPosts,
    error: errorPosts,
  } = useUserPosts(shouldFetchPosts ? targetUser?.id : null);

  // Загружаем треки пользователя только когда активна вкладка Music
  const shouldFetchTracks = activeTab === 'Music';
  const {
    tracks: apiTracks,
    pagination: paginationTracks,
    isLoading: tracksLoading,
    error: errorTracks,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updatePlayCount,
    updateCommentCount: updateCommentCountTrack,
    toggleFavorite: toggleFavoriteTrack,
    refetch: refetchTracks,
  } = useUserMusicLibrary(shouldFetchTracks ? targetUser?.id : null);

  // Загружаем видео пользователя только когда активна вкладка Video
  const shouldFetchVideos = activeTab === 'Video';
  const {
    videos: apiVideos,
    pagination: paginationVideos,
    isLoading: videosLoading,
    error: errorVideos,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateCommentCount: updateCommentCountVideo,
    updateViewCount,
    toggleFavorite: toggleFavoriteVideo,
    refetch: refetchVideos,
  } = useUserVideoLibrary(shouldFetchVideos ? targetUser?.id : null);

  //  Фильтрация по типу контента и пользователю
  const filteredItems = useMemo(() => {
    if (!targetUser?.id) return [];

    switch (activeTab) {
      case 'Post':
        return apiPosts || [];
      case 'Photo':
        return (apiPosts || []).filter((post) => post.postType === 'image');
      case 'Music':
        // Для профиля подменяем дату загрузки на дату добавления в библиотеку
        return (apiTracks || []).map((track) => ({
          ...track,
          createdAt: track.libraryCreatedAt || track.createdAt,
        }));
      case 'Video':
        // Для профиля подменяем дату загрузки на дату добавления в библиотеку
        return (apiVideos || []).map((video) => ({
          ...video,
          createdAt: video.libraryCreatedAt || video.createdAt,
        }));

      default:
        return [];
    }
  }, [activeTab, targetUser?.id, apiPosts, apiTracks, apiVideos]);

  // Сортировка
  const sortedItems = useMemo(() => {
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return filteredItems;
    return sortByData(filteredItems, sortConfig, activeTab);
  }, [activeTab, sortKey, filteredItems]);

  // Флаги загрузки профиля/постов/треков/видео
  const isLoadingProfile = (isUserLoading && !isOwnProfile) || !currentUser;
  const isLoadingPosts = shouldFetchPosts && postsLoading;
  const isLoadingTracks = shouldFetchTracks && tracksLoading;
  const isLoadingVideos = shouldFetchVideos && videosLoading;

  return {
    currentUser,
    targetUser,
    userError,
    items: sortedItems,
    isLoadingProfile,
    // Посты
    isLoadingPosts,
    paginationPosts,
    errorPosts,
    toggleLikePost,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    updateCommentCountPost,
    refetchPosts,
    // Треки
    isLoadingTracks,
    paginationTracks,
    errorTracks,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updatePlayCount,
    toggleFavoriteTrack,
    updateCommentCountTrack,
    refetchTracks,
    // Видео
    isLoadingVideos,
    paginationVideos,
    errorVideos,
    refetchVideos,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    toggleFavoriteVideo,
    updateCommentCountVideo,
    updateViewCount,
  };
};
