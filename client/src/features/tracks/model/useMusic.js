import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchTracks,
  normalizeTrack,
  addTrackToLibrary,
  removeTrackFromLibrary,
  incrementGlobalPlayCount,
  createTrack,
  deleteTrack,
} from '../../../entities/track';
import { addLike, deleteLike } from '../../../entities/like';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для получения и отображения треков на странице музыки.
 * @param {Object} params
 * @param {string} [params.filter] – жанр (All, Rock, Pop…)
 * @param {string} [params.searchQuery] – текст поиска
 * @param {string} [params.sortKey] – ключ сортировки
 * @returns {{ tracks: Array, pagination: Object|null, isLoading: boolean, error: string|null, toggleLikeTrack: Function, addTrackOptimistic: Function, removeTrackOptimistic: Function, updatePlayCount: Function, updateCommentCount: Function }}
 */
export function useMusic({ filter, searchQuery, sortKey } = {}) {
  const [rawTracks, setRawTracks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const currentUser = useSelector((state) => state.auth?.user);

  const loadTracks = useCallback(async (genre, query) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTracks({
        genre,
        q: query?.trim() || undefined,
      });
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
  }, []);

  // При изменении фильтра сразу загружаем
  useEffect(() => {
    loadTracks(filter, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // При изменении searchQuery делаем debounce (400 мс)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadTracks(filter, searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Нормализация и сортировка на клиенте
  const tracks = useMemo(() => {
    if (!Array.isArray(rawTracks)) return [];
    const normalized = rawTracks.map((item) => ({
      ...normalizeTrack(item, currentUser?.id),
      profileLibraryId: null, // сбрасываем для общей страницы
    }));
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return normalized;
    return sortByData(normalized, sortConfig, 'Music');
  }, [rawTracks, currentUser?.id, sortKey]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} trackId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeTrack = useCallback(
    async (trackId, currentlyLiked) => {
      if (!currentUser?.id) return;
      setRawTracks((prev) =>
        prev.map((track) =>
          track.id === trackId
            ? {
                ...track,
                likes: currentlyLiked
                  ? (track.likes || []).filter((like) => like.userId !== currentUser?.id)
                  : [...(track.likes || []), { userId: currentUser?.id }],
              }
            : track
        )
      );

      try {
        if (currentlyLiked) {
          await deleteLike('Music', trackId);
        } else {
          await addLike('Music', trackId);
        }
      } catch (err) {
        setRawTracks((prev) =>
          prev.map((track) =>
            track.id === trackId
              ? {
                  ...track,
                  likes: currentlyLiked
                    ? [...(track.likes || []), { userId: currentUser?.id }]
                    : (track.likes || []).filter((like) => like.userId !== currentUser?.id),
                }
              : track
          )
        );
        console.error('Ошибка лайка трека:', err);
      }
    },
    [currentUser?.id]
  );

  /**
   * Удаление трека из библиотеки (оптимистично).
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
              }
            : track
        )
      );
      try {
        await removeTrackFromLibrary(libraryId);
        loadTracks();
      } catch (err) {
        console.error('Ошибка удаления трека из библиотеки:', err);
        setRawTracks((prev) =>
          prev.map((track) => (track.id === trackId ? { ...track, isInLibrary: true } : track))
        );
        loadTracks();
      }
    },
    [loadTracks]
  );

  /**
   * Добавление трека в библиотеку (оптимистично).
   * @param {number} trackId – ID трека
   */
  const addTrackOptimistic = useCallback(
    async (trackId) => {
      // Обновляем rawTracks для мгновенного UI
      setRawTracks((prev) =>
        prev.map((track) => (track.id === trackId ? { ...track, isInLibrary: true } : track))
      );
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
        loadTracks();
      }
    },
    [loadTracks]
  );

  /**
   * Оптимистичное обновления глобального счетчика прослушиваний
   * @param {number} trackId - ID трека
   */
  const updateGlobalPlayCount = useCallback(async (trackId) => {
    if (!trackId) return;
    // Оптимистично увеличиваем счётчик
    setRawTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, playCount: (track.playCount ?? 0) + 1 } : track
      )
    );
    try {
      await incrementGlobalPlayCount(trackId);
    } catch (err) {
      // Откат при ошибке
      setRawTracks((prev) =>
        prev.map((track) =>
          track.id === trackId ? { ...track, playCount: (track.playCount ?? 1) - 1 } : track
        )
      );
      console.error('Ошибка обновления трека из библиотеки:', err);
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
    paginationTracks: pagination,
    isLoadingTracks: isLoading,
    errorTracks: error,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updateGlobalPlayCount,
    updateCommentCount,
  };
}
