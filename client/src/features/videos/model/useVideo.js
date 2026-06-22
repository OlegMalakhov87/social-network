import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchVideos,
  normalizeVideo,
  addVideoToLibrary,
  removeVideoFromLibrary,
  incrementViewCount,
  createVideo,
  deleteVideo,
} from '../../../entities/video';
import { addLike, deleteLike } from '../../../entities/like';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для получения и отображения видео на странице видео.
 * @param {Object} params
 * @param {string} [params.filter] – категория (All, Movie, Music…)
 * @param {string} [params.searchQuery] – текст поиска
 * @param {string} [params.sortKey] – ключ сортировки
 * @returns {{ videos: Array, pagination: Object|null, isLoading: boolean, error: string|null, toggleLikeVideo: Function, addVideoOptimistic: Function, removeVideoOptimistic: Function, updateGlobalViewCount: Function, updateCommentCount: Function }}
 */
export function useVideos({ filter, searchQuery, sortKey } = {}) {
  const [rawVideos, setRawVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const currentUser = useSelector((state) => state.auth?.user);

  const loadVideos = useCallback(async (category, query) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchVideos({ category, q: query?.trim() || undefined });
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
  }, []);

  // При изменении фильтра сразу загружаем
  useEffect(() => {
    loadVideos(filter, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // При вводе поиска – debounce 400 мс
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadVideos(filter, searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Нормализация и сортировка на клиенте
  const videos = useMemo(() => {
    if (!Array.isArray(rawVideos)) return [];
    const normalized = rawVideos.map((item) => ({
      ...normalizeVideo(item, currentUser?.id),
      profileLibraryId: null, // сбрасываем для общей страницы
    }));
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return normalized;
    return sortByData(normalized, sortConfig, 'Video');
  }, [rawVideos, currentUser?.id, sortKey]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} videoId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeVideo = useCallback(
    async (videoId, currentlyLiked) => {
      setRawVideos((prev) =>
        prev.map((video) =>
          video.id === videoId
            ? {
                ...video,
                likes: currentlyLiked
                  ? (video.likes || []).filter((like) => like.userId !== currentUser?.id)
                  : [...(video.likes || []), { userId: currentUser?.id }],
              }
            : video
        )
      );

      try {
        if (currentlyLiked) {
          await deleteLike('Video', videoId);
        } else {
          await addLike('Video', videoId);
        }
      } catch (err) {
        setRawVideos((prev) =>
          prev.map((video) =>
            video.id === videoId
              ? {
                  ...video,
                  likes: currentlyLiked
                    ? [...(video.likes || []), { userId: currentUser?.id }]
                    : (video.likes || []).filter((like) => like.userId !== currentUser?.id),
                }
              : video
          )
        );
        console.error('Ошибка лайка видео:', err);
      }
    },
    [currentUser?.id]
  );

  /**
   * Удаление видео из библиотеки (оптимистично).
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
              }
            : video
        )
      );
      try {
        await removeVideoFromLibrary(libraryId);
        loadVideos();
      } catch (err) {
        console.error('Ошибка удаления видео из библиотеки:', err);
        setRawVideos((prev) =>
          prev.map((video) => (video.id === videoId ? { ...video, isInLibrary: true } : video))
        );
        loadVideos();
      }
    },
    [loadVideos]
  );

  /**
   * Добавление видео в библиотеку (оптимистично).
   * @param {number} videoId – ID видео
   */
  const addVideoOptimistic = useCallback(
    async (videoId) => {
      // Обновляем rawVideos для мгновенного UI
      setRawVideos((prev) =>
        prev.map((video) => (video.id === videoId ? { ...video, isInLibrary: true } : video))
      );
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
        loadVideos();
      }
    },
    [loadVideos]
  );

  /**
   * Оптимистичное обновления глобального счетчика просмотров
   * @param {number} videoId - ID трека
   */
  const updateGlobalViewCount = useCallback(async (videoId) => {
    if (!videoId) return;
    // Оптимистично увеличиваем счётчик
    setRawVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, viewCount: (video.viewCount ?? 0) + 1 } : video
      )
    );
    try {
      await incrementViewCount(videoId);
    } catch (err) {
      // Откат при ошибке
      setRawVideos((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, viewCount: (video.viewCount ?? 1) - 1 } : video
        )
      );
      console.error('Ошибка обновления видео из библиотеки:', err);
    }
  }, []);

  /**
   * Обновление счетчика комментариев к карточке видео.
   * @param {number} videoId – ID трека
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
    paginationVideos: pagination,
    isLoadingVideos: isLoading,
    errorVideos: error,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateGlobalViewCount,
    updateCommentCount,
  };
}
