import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTrack,
  addTrackToLibrary,
  removeTrackFromLibrary,
  updateTrackFromLibrary,
} from '../../../entities/track';
import { addLike, deleteLike } from '../../../entities/like';

/**
 * Хук для получения треков библиотеки пользователя.
 * @param {number} profileUserId
 * @param {Object} filters – { page, limit, visibility }
 * @returns {{ tracks: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function }}
 */
export function useUserMusicLibrary(profileUserId) {
  const [rawTracks, setRawTracks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);

  const isOwnProfile = Number(profileUserId) === Number(currentUserId);

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
      if (currentUserId && profileUserId === currentUserId) {
        // Свой профиль: запрашиваем МОЮ библиотеку
        data = await fetchMyMusicLibrary({ page: 1, limit: 30 });
      } else {
        // Чужой профиль: запрашиваем ЕГО библиотеку + статус для моей кнопки
        data = await fetchUserMusicLibrary(profileUserId, { page: 1, limit: 30 });
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
  }, [profileUserId, currentUserId]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const tracks = useMemo(() => {
    if (!Array.isArray(rawTracks)) return [];
    return rawTracks.map((entry) => normalizeTrack(entry, currentUserId));
  }, [rawTracks, currentUserId]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} trackId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeTrack = useCallback(
    async (trackId, currentlyLiked) => {
      setRawTracks((prev) =>
        prev.map((entry) => {
          if (entry.id !== trackId) return entry;
          const track = entry;
          const likes = track.likes || [];
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
          await deleteLike('Music', trackId);
        } else {
          await addLike('Music', trackId);
        }
      } catch (err) {
        setRawTracks((prev) =>
          prev.map((entry) => {
            if (entry.id !== trackId) return entry;
            const track = entry;
            const likes = track.likes || [];
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
   * Удаление трека из библиотеки.
   * @param {number} libraryId – запись в библиотеке
   * @param {number} trackId – ID трека
   */
  const removeTrackOptimistic = useCallback(
    async (libraryId, trackId) => {
      if (!trackId) return;

      // Обновляем rawTracks для мгновенного UI
      setRawTracks((prev) =>
        prev.map((track) =>
          track.id === trackId
            ? {
                ...track,
                isInLibrary: false,
                isFavorite: false,
              }
            : track
        )
      );
      try {
        await removeTrackFromLibrary(libraryId);
        fetchTracks();
      } catch (err) {
        console.error('Ошибка удаления трека из библиотеки:', err);
        setRawTracks((prev) =>
          prev.map((track) => (track.id === trackId ? { ...track, isInLibrary: true } : track))
        );
        fetchTracks();
      }
    },
    [fetchTracks]
  );

  /**
   * Добавление трека в библиотеку.
   * @param {number} trackId – ID трека
   */
  const addTrackOptimistic = useCallback(
    async (trackId) => {
      // Обновляем rawTracks для мгновенного UI
      if (isOwnProfile) {
        // Свой профиль – сбрасываем счётчик
        setRawTracks((prev) =>
          prev.map((track) =>
            track.id === trackId ? { ...track, isInLibrary: true, playCount: 0 } : track
          )
        );
      } else {
        // Чужой профиль – только моя кнопка, данные профиля не трогаем
        setRawTracks((prev) =>
          prev.map((t) => (t.id === trackId ? { ...t, isInLibrary: true } : t))
        );
      }
      try {
        const result = await addTrackToLibrary(trackId);
        const newLibraryId = result?.libraryItem?.id;
        if (newLibraryId) {
          setRawTracks((prev) =>
            prev.map((track) =>
              track.id === trackId ? { ...track, libraryId: newLibraryId } : track
            )
          );
        }
      } catch (err) {
        console.error('Ошибка добавления трека в библиотеку:', err);
        setRawTracks((prev) =>
          prev.map((track) => (track.id === trackId ? { ...track, isInLibrary: false } : track))
        );
        fetchTracks();
      }
    },
    [isOwnProfile, fetchTracks]
  );

  /**
   * Оптимистичное обновления счетчика прослушиваний
   * @param {number} trackId - ID трека
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} isFavorite - в избранном или нет (текущее состояние)
   * @param {number} newPlayCount – количество прослушиваний
   */
  const updatePlayCount = useCallback(async (trackId, libraryId, isFavorite, newPlayCount) => {
    if (!trackId || !libraryId) return;
    // Оптимистично увеличиваем счётчик
    setRawTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, playCount: newPlayCount } : track))
    );
    try {
      await updateTrackFromLibrary(libraryId, {
        playCount: newPlayCount,
        isFavorite, // сохраняем текущее состояние избранного
      });
    } catch (err) {
      // Откат при ошибке
      setRawTracks((prev) =>
        prev.map((track) =>
          track.id === trackId
            ? {
                ...track,
                playCount: newPlayCount - 1,
              }
            : track
        )
      );
      console.error('Ошибка обновления трека из библиотеки:', err);
    }
  }, []);

  /**
   * Оптимистичное добавление/ удаление в избранное
   * @param {number} trackId - ID трека
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} currentlyFavorite - в избранном или нет (текущее состояние)
   * @param {number} playCount – количество прослушиваний
   */
  const toggleFavorite = useCallback(async (trackId, libraryId, currentlyFavorite, playCount) => {
    if (!trackId || !libraryId) return;
    const newFavorite = !currentlyFavorite;
    // Оптимистично обновляем UI
    setRawTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, isFavorite: newFavorite } : track))
    );
    try {
      await updateTrackFromLibrary(libraryId, { isFavorite: newFavorite, playCount });
    } catch (err) {
      // Откат
      setRawTracks((prev) =>
        prev.map((track) =>
          track.id === trackId ? { ...track, isFavorite: currentlyFavorite } : track
        )
      );
      console.error('Ошибка избранного:', err);
    }
  }, []);

  /**
   * Обновление счетчика комментариев к карточке трека.
   * @param {number} trackId – ID трека
   * @param {number} delta
   */
  const updateCommentCount = useCallback((trackId, delta) => {
    setRawTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, commentsCount: (track.commentsCount ?? 0) + delta }
          : track
      )
    );
  }, []);

  return {
    tracks,
    pagination,
    isLoading,
    error,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updatePlayCount,
    updateCommentCount,
    toggleFavorite,
    refetch: fetchTracks,
  };
}
