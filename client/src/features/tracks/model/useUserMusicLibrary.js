import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTrack,
} from '../../../entities/track';

/**
 * Хук для получения треков библиотеки пользователя.
 * @param {number|null} profileUserId - ID пользователя
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля
 * @returns {{ tracks: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function, setRawTracks: Function }}
 */
export function useUserMusicLibrary(
  profileUserId,
  currentUserId,
  isOwnProfile
) {
  const [rawTracks, setRawTracks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Получение треков библиотеки пользователя.
   */
  const fetchTracks = useCallback(async () => {
    if (!profileUserId || profileUserId <= 0) {
      setRawTracks([]);
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
        data = await fetchMyMusicLibrary({ page: 1, limit: 30 });
      } else {
        // Чужой профиль: запрашиваем ЕГО библиотеку + статус для моей кнопки
        data = await fetchUserMusicLibrary(profileUserId, {
          page: 1,
          limit: 30,
        });
      }

      const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
      const tracksWithCount = tracks.map((track) => ({
        ...track,
        commentsCount: track.comments?.length ?? 0,
      }));
      setRawTracks(tracksWithCount || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      setRawTracks([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileUserId, isOwnProfile]);

  /**
   * Загрузка треков библиотеки пользователя при монтировании компонента.
   */
  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  /**
   * Нормализация треков библиотеки пользователя.
   */
  const tracks = useMemo(() => {
    if (!Array.isArray(rawTracks)) return [];
    return rawTracks.map((entry) => normalizeTrack(entry, currentUserId));
  }, [rawTracks, currentUserId]);

  /**
   * Возвращаем объект с данными о треках библиотеки пользователя.
   */
  return {
    tracks,
    pagination,
    isLoading,
    error,
    setRawTracks,
    refetch: fetchTracks,
  };
}
