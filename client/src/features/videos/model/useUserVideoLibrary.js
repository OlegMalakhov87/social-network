import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchMyVideoLibrary,
  fetchUserVideoLibrary,
  normalizeVideo,
} from '../../../entities/video';

/**
 * Хук для получения видео библиотеки пользователя.
 * @param {number|null} profileUserId - ID пользователя
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля
 * @returns {{ videos: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function, setRawVideos: Function }}
 */
export function useUserVideoLibrary(
  profileUserId,
  currentUserId,
  isOwnProfile
) {
  const [rawVideos, setRawVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Получение видео библиотеки пользователя.
   */
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
      if (isOwnProfile) {
        // Свой профиль: запрашиваем МОЮ библиотеку
        data = await fetchMyVideoLibrary({ page: 1, limit: 30 });
      } else {
        // Чужой профиль: запрашиваем ЕГО библиотеку + статус для моей кнопки
        data = await fetchUserVideoLibrary(profileUserId, {
          page: 1,
          limit: 30,
        });
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
  }, [profileUserId, isOwnProfile]);

  /**
   * Загрузка видео библиотеки пользователя при монтировании компонента.
   */
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  /**
   * Нормализация видео библиотеки пользователя.
   */
  const videos = useMemo(() => {
    if (!Array.isArray(rawVideos)) return [];
    return rawVideos.map((entry) => normalizeVideo(entry, currentUserId));
  }, [rawVideos, currentUserId]);

  /**
   * Возвращаем объект с данными о видео библиотеке пользователя.
   */
  return {
    videos,
    pagination,
    isLoading,
    error,
    setRawVideos,
    refetcsetRawVideosh: fetchVideos,
  };
}
