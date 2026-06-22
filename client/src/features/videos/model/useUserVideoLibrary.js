import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchMyVideoLibrary,
  fetchUserVideoLibrary,
  normalizeVideo,
  addVideoToLibrary,
  removeVideoFromLibrary,
  updateVideoFromLibrary,
} from '../../../entities/video';
import { addLike, deleteLike } from '../../../entities/like';

/**
 * Хук для получения видео библиотеки пользователя.
 * @param {number} profileUserId
 * @param {Object} filters – { page, limit, visibility }
 * @returns {{ videos: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function }}
 */
export function useUserVideoLibrary(profileUserId) {
  const [rawVideos, setRawVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);

  const isOwnProfile = Number(profileUserId) === Number(currentUserId);

  const fetchVideos = useCallback(async () => {
    if (!profileUserId || profileUserId <= 0) {
      setRawVideos([]);
      setPagination(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      let data;
      //  Выбираем эндпоинт в зависимости от профиля
      if (currentUserId && profileUserId === currentUserId) {
        // Свой профиль: запрашиваем МОЮ библиотеку
        data = await fetchMyVideoLibrary({ page: 1, limit: 30 });
      } else {
        // Чужой профиль: запрашиваем ЕГО библиотеку + статус для моей кнопки
        data = await fetchUserVideoLibrary(profileUserId, { page: 1, limit: 30 });
      }

      const videos = Array.isArray(data?.videos) ? data.videos : [];
      const videoWithCount = videos.map((video) => ({
        ...video,
        commentsCount: video.comments?.length ?? 0,
      }));
      setRawVideos(videoWithCount || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      setRawVideos([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileUserId, currentUserId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const videos = useMemo(() => {
    if (!Array.isArray(rawVideos)) return [];
    return rawVideos.map((entry) => normalizeVideo(entry, currentUserId));
  }, [rawVideos, currentUserId]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} videoId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeVideo = useCallback(
    async (videoId, currentlyLiked) => {
      setRawVideos((prev) =>
        prev.map((entry) => {
          if (entry.id !== videoId) return entry;
          const video = entry;
          const likes = video.likes || [];
          const newLikes = currentlyLiked
            ? likes.filter((like) => like.userId !== currentUserId)
            : [...likes, { userId: currentUserId }];
          return {
            ...entry,
            likes: newLikes,
          };
        })
      );
      try {
        if (currentlyLiked) {
          await deleteLike('Video', videoId);
        } else {
          await addLike('Video', videoId);
        }
      } catch (err) {
        setRawVideos((prev) =>
          prev.map((entry) => {
            if (entry.id !== videoId) return entry;
            const video = entry;
            const likes = video.likes || [];
            const newLikes = currentlyLiked
              ? [...likes, { userId: currentUserId }]
              : likes.filter((like) => like.userId !== currentUserId);
            return {
              ...entry,
              likes: newLikes,
            };
          })
        );
        console.error('Ошибка лайка:', err);
      }
    },
    [currentUserId]
  );

  /**
   * Удаление видео из библиотеки.
   * @param {number} libraryId – запись в библиотеке
   * @param {number} videoId – ID видео
   */
  const removeVideoOptimistic = useCallback(
    async (libraryId, videoId) => {
      if (!videoId) return;

      // Обновляем rawVideos для мгновенного UI
      setRawVideos((prev) =>
        prev.map((video) =>
          video.id === videoId
            ? {
                ...video,
                isInLibrary: false,
                isFavorite: false,
                libraryCreatedAt: null,
                lastWatchedAt: null,
              }
            : video
        )
      );
      try {
        await removeVideoFromLibrary(libraryId);
        fetchVideos();
      } catch (err) {
        console.error('Ошибка удаления видео из библиотеки:', err);
        setRawVideos((prev) =>
          prev.map((video) => (video.id === videoId ? { ...video, isInLibrary: true } : video))
        );
        fetchVideos();
      }
    },
    [fetchVideos]
  );

  /**
   * Добавление видео в библиотеку.
   * @param {number} videoId – ID видео
   */
  const addVideoOptimistic = useCallback(
    async (videoId) => {
      // Обновляем rawVideos для мгновенного UI
      if (isOwnProfile) {
        // Свой профиль – сбрасываем счётчик, ставим дату добавления
        setRawVideos((prev) =>
          prev.map((video) =>
            video.id === videoId
              ? { ...video, isInLibrary: true, viewCount: 0, libraryCreatedAt: new Date() }
              : video
          )
        );
      } else {
        // Чужой профиль – только моя кнопка, данные профиля не трогаем
        setRawVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, isInLibrary: true } : v))
        );
      }
      try {
        const result = await addVideoToLibrary(videoId);
        const newLibraryId = result?.libraryItem?.id;
        if (newLibraryId) {
          setRawVideos((prev) =>
            prev.map((video) =>
              video.id === videoId ? { ...video, libraryId: newLibraryId } : video
            )
          );
        }
      } catch (err) {
        console.error('Ошибка добавления видео в библиотеку:', err);
        setRawVideos((prev) =>
          prev.map((video) => (video.id === videoId ? { ...video, isInLibrary: false } : video))
        );
        fetchVideos();
      }
    },
    [isOwnProfile, fetchVideos]
  );

  /**
   * Оптимистичное обновления счетчика просмотров
   * @param {number} videoId - ID видео
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} isFavorite - в избранном или нет (текущее состояние)
   * @param {number} newWatchCount – количество просмотров
   */
  const updateViewCount = useCallback(async (videoId, libraryId, isFavorite, newViewCount) => {
    if (!videoId || !libraryId) return;
    // Оптимистично увеличиваем счётчик
    setRawVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              viewCount: newViewCount,
              lastWatchedAt: new Date(),
            }
          : video
      )
    );
    try {
      await updateVideoFromLibrary(libraryId, {
        viewCount: newViewCount,
        isFavorite, // сохраняем текущее состояние избранного
        lastWatchedAt: new Date(),
      });
    } catch (err) {
      // Откат при ошибке
      setRawVideos((prev) =>
        prev.map((video) =>
          video.id === videoId
            ? {
                ...video,
                viewCount: newViewCount - 1,
                lastWatchedAt: new Date(),
              }
            : video
        )
      );
      console.error('Ошибка обновления видео из библиотеки:', err);
    }
  }, []);

  /**
   * Оптимистичное добавление/ удаление в избранное
   * @param {number} videoId - ID видео
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} currentlyFavorite - в избранном или нет (текущее состояние)
   * @param {number} viewCount – количество просмотров
   */
  const toggleFavorite = useCallback(
    async (videoId, libraryId, currentlyFavorite, viewCount, lastWatchedAt) => {
      if (!videoId || !libraryId) return;
      const newFavorite = !currentlyFavorite;
      // Оптимистично обновляем UI
      setRawVideos((prev) =>
        prev.map((video) => (video.id === videoId ? { ...video, isFavorite: newFavorite } : video))
      );
      try {
        await updateVideoFromLibrary(libraryId, {
          isFavorite: newFavorite,
          viewCount,
          lastWatchedAt,
        });
      } catch (err) {
        // Откат
        setRawVideos((prev) =>
          prev.map((video) =>
            video.id === videoId ? { ...video, isFavorite: currentlyFavorite } : video
          )
        );
        console.error('Ошибка избранного:', err);
      }
    },
    []
  );

  /**
   * Обновление счетчика комментариев к карточке видео.
   * @param {number} videoId – ID видео
   * @param {number} delta
   */
  const updateCommentCount = useCallback((videoId, delta) => {
    setRawVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? { ...video, commentsCount: (video.commentsCount ?? 0) + delta }
          : video
      )
    );
  }, []);

  return {
    videos,
    pagination,
    isLoading,
    error,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateViewCount,
    updateCommentCount,
    toggleFavorite,
    refetch: fetchVideos,
  };
}
