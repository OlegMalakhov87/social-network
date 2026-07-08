import { useMemo } from 'react';
import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';
import { sortByData } from '../../../shared/lib';
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
 * @returns {{
 *   items: Array.<Object>,
 *   isLoading: boolean,
 *   currentUser: Object|null,
 *   targetUser: Object|null
 * }}
 * @property {Array.<Object>} items - отфильтрованный и отсортированный массив сущностей (посты/фото/треки/видео)
 * @property {boolean} isLoading - флаг загрузки (true, пока не определён currentUser)
 * @property {Object|null} currentUser - данные авторизованного пользователя
 * @property {Object|null} targetUser - данные пользователя, чей профиль просматриваем (совпадает с currentUser, если это свой профиль)
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
    Post: {
      posts: true,
    },

    Photo: {
      posts: true,
    },

    Music: {
      tracks: true,
    },

    Video: {
      videos: true,
    },
  };

  const config = fetchMap[activeTab] ?? {};

  /**
   * Загружаем посты пользователя только когда активна вкладка Post или Photo
   * @returns {Object} данные о постах пользователя
   */

  const {
    posts: apiPosts,
    isLoading: postsLoading,
    pagination: paginationPosts,
    error: errorPosts,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    setRawPosts,
    refetch: refetchPosts,
  } = useUserPosts(
    config.posts ? targetUser?.id : null,
    currentUser?.id,
    isOwnProfile
  );

  /**
   * Загружаем треки пользователя только когда активна вкладка Music
   * @returns {Object} данные о треках пользователя
   */

  const {
    tracks: apiTracks,
    isLoading: tracksLoading,
    pagination: paginationTracks,
    error: errorTracks,
    setRawTracks,
    refetch: refetchTracks,
  } = useUserMusicLibrary(
    config.tracks ? targetUser?.id : null,
    currentUser?.id,
    isOwnProfile
  );

  /**
   * Загружаем видео пользователя только когда активна вкладка Video
   * @returns {Object} данные о видео пользователя
   */

  const {
    videos: apiVideos,
    isLoading: videosLoading,
    pagination: paginationVideos,
    error: errorVideos,
    setRawVideos,
    refetch: refetchVideos,
  } = useUserVideoLibrary(
    config.videos ? targetUser?.id : null,
    currentUser?.id,
    isOwnProfile
  );

  /**
   * Получаем данные о библиотеке пользователя
   * @returns {Object} данные о библиотеке пользователя
   */
  const {
    toggleLikeItem,
    removeItemOptimistic,
    addItemOptimistic,
    updateItemCount,
    toggleFavorite,
    updateCommentCount,
  } = useLibraryResource(
    currentUser?.id,
    isOwnProfile,
    activeTab,
    refetchVideos,
    refetchTracks,
    refetchPosts,
    setRawVideos,
    setRawTracks,
    setRawPosts
  );

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
   * Сортировка
   * @returns {Array.<Object>} отфильтрованный и отсортированный массив сущностей (посты/фото/треки/видео)
   */
  const sortedItems = useMemo(() => {
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return filteredItems;
    return sortByData(filteredItems, sortConfig, activeTab);
  }, [activeTab, sortKey, filteredItems]);

  /**
   * Флаги загрузки профиля/постов/треков/видео
   * @returns {boolean} true, если загрузка профиля/постов/треков/видео
   */
  const isLoadingProfile = (userLoading && !isOwnProfile) || !currentUser;
  const isLoadingPosts = config.posts && postsLoading;
  const isLoadingTracks = config.tracks && tracksLoading;
  const isLoadingVideos = config.videos && videosLoading;

  /**
   * Возвращаем объект с данными о контенте пользователя
   * @returns {Object} объект с данными о контенте пользователя
   */
  return {
    currentUser,
    targetUser,
    userError,
    items: sortedItems,
    isLoadingProfile,
    toggleLikeItem,
    removeItemOptimistic,
    addItemOptimistic,
    updateItemCount,
    toggleFavorite,
    updateCommentCount,
    // Посты
    isLoadingPosts,
    paginationPosts,
    errorPosts,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    refetchPosts,
    // Треки
    isLoadingTracks,
    paginationTracks,
    errorTracks,
    refetchTracks,
    // Видео
    isLoadingVideos,
    paginationVideos,
    errorVideos,
    refetchVideos,
  };
};
