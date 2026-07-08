import { useCallback, useMemo } from 'react';
import { addLike, deleteLike } from '../../../entities/like';
import {
  addTrackToLibrary,
  removeTrackFromLibrary,
  updateTrackFromLibrary,
} from '../../../entities/track';
import {
  addVideoToLibrary,
  removeVideoFromLibrary,
  updateVideoFromLibrary,
} from '../../../entities/video ';

/**
 * Хук для управления ресурсами библиотеки.
 * @param {number|null} currentUserId - ID текущего пользователя.
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля.
 * @param {string} activeTab - текущая вкладка.
 * @param {Function} refetchVideos - функция для обновления видео.
 * @param {Function} refetchTracks - функция для обновления треков.
 * @param {Function} refetchPosts - функция для обновления постов.
 * @param {Function} setRawVideos - функция для обновления rawItems видео.
 * @param {Function} setRawTracks - функция для обновления rawItems треков.
 * @param {Function} setRawPosts - функция для обновления rawItems постов.
 */
export function useLibraryResource(
  currentUserId,
  isOwnProfile,
  activeTab,
  refetchVideos,
  refetchTracks,
  refetchPosts,
  setRawVideos,
  setRawTracks,
  setRawPosts
) {
  /**
   * Получение функции для обновления rawItems в зависимости от типа контента
   */
  const setRawItems = useMemo(() => {
    const map = {
      videos: setRawVideos,
      tracks: setRawTracks,
      posts: setRawPosts,
      photos: setRawPosts,
    };
    return (
      map[activeTab] ||
      (() => {
        console.error('Неизвестный тип контента:', activeTab);
        return () => {};
      })
    );
  }, [activeTab, setRawVideos, setRawTracks, setRawPosts]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} itemId – ID сущности.
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeItem = useCallback(
    async (itemId, currentlyLiked) => {
      setRawItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const likes = item.likes || [];
          const newLikes = currentlyLiked
            ? likes.filter((like) => like.userId !== currentUserId)
            : [...likes, { userId: currentUserId }];
          return {
            ...item,
            likes: newLikes,
          };
        })
      );
      try {
        if (currentlyLiked) {
          await deleteLike(activeTab, itemId);
        } else {
          await addLike(activeTab, itemId);
        }
      } catch (err) {
        setRawItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const likes = item.likes || [];
            const newLikes = currentlyLiked
              ? [...likes, { userId: currentUserId }]
              : likes.filter((like) => like.userId !== currentUserId);
            return {
              ...item,
              likes: newLikes,
            };
          })
        );
        console.error('Ошибка лайка:', err);
      }
    },
    [currentUserId, activeTab, setRawItems]
  );

  /**
   * Удаление сущности из библиотеки.
   * @param {number} itemId – ID сущности.
   * @param {number} libraryId – запись в библиотеке
   */
  const removeItemOptimistic = useCallback(
    async (itemId, libraryId) => {
      if (!itemId) return;

      // Обновляем rawItems для мгновенного UI
      setRawItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isInLibrary: false,
                isFavorite: false,
                libraryCreatedAt: null, // дата добавления в библиотеку
                ...(activeTab === 'videos' ? { lastWatchedAt: null } : null),
              }
            : item
        )
      );
      try {
        if (activeTab === 'videos') {
          await removeVideoFromLibrary(libraryId);
          refetchVideos();
        } else if (activeTab === 'tracks') {
          await removeTrackFromLibrary(libraryId);
          refetchTracks();
        }
      } catch (err) {
        console.error('Ошибка удаления сущности из библиотеки:', err);
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: true } : item
          )
        );
        if (activeTab === 'videos') {
          refetchVideos();
        } else if (activeTab === 'tracks') {
          refetchTracks();
        }
      }
    },
    [activeTab, refetchVideos, refetchTracks, setRawItems]
  );

  /**
   * Добавление сущности в библиотеку.
   * @param {number} itemId – ID сущности.
   */
  const addItemOptimistic = useCallback(
    async (itemId) => {
      // Обновляем rawItems для мгновенного UI
      if (isOwnProfile) {
        // Свой профиль – сбрасываем счётчик, ставим дату добавления
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isInLibrary: true,
                  ...(activeTab === 'videos'
                    ? { viewCount: 0 }
                    : { playCount: 0 }),
                  libraryCreatedAt: new Date(),
                }
              : item
          )
        );
      } else {
        // Чужой профиль – только моя кнопка, данные профиля не трогаем
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: true } : item
          )
        );
      }
      try {
        let result;
        if (activeTab === 'videos') {
          result = await addVideoToLibrary(itemId);
        } else if (activeTab === 'tracks') {
          result = await addTrackToLibrary(itemId);
        }
        if (result) {
          setRawItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, libraryId: result.libraryItem.id }
                : item
            )
          );
        }
      } catch (err) {
        console.error('Ошибка добавления сущности в библиотеку:', err);
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: false } : item
          )
        );
        if (activeTab === 'videos') {
          refetchVideos();
        } else if (activeTab === 'tracks') {
          refetchTracks();
        }
      }
    },
    [isOwnProfile, activeTab, refetchVideos, refetchTracks, setRawItems]
  );

  /**
   * Оптимистичное обновления счетчика просмотров/ прослушиваний
   * @param {number} itemId - ID сущности.
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} isFavorite - в избранном или нет (текущее состояние)
   * @param {number} newCount – количество просмотров/ прослушиваний
   */
  const updateItemCount = useCallback(
    async (itemId, libraryId, isFavorite, newCount) => {
      if (!itemId || !libraryId) return;
      // Оптимистично увеличиваем счётчик
      setRawItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(activeTab === 'videos'
                  ? {
                      viewCount: newCount,
                      lastWatchedAt: new Date().toISOString(),
                    }
                  : { playCount: newCount }),
              }
            : item
        )
      );
      try {
        if (activeTab === 'videos') {
          await updateVideoFromLibrary(libraryId, {
            viewCount: newCount,
            isFavorite,
            lastWatchedAt: new Date().toISOString(),
          });
        } else if (activeTab === 'tracks') {
          await updateTrackFromLibrary(libraryId, {
            playCount: newCount,
            isFavorite,
          });
        }
      } catch (err) {
        // Откат при ошибке
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...(activeTab === 'videos'
                    ? {
                        viewCount: newCount - 1,
                        lastWatchedAt: new Date().toISOString(),
                      }
                    : { playCount: newCount - 1 }),
                }
              : item
          )
        );
        console.error('Ошибка обновления счетчика:', err);
      }
    },
    [activeTab, setRawItems]
  );

  /**
   * Оптимистичное добавление/ удаление в избранное
   * @param {number} itemId - ID сущности.
   * @param {number} libraryId – запись в библиотеке
   * @param {boolean} currentlyFavorite - в избранном или нет (текущее состояние)
   * @param {number} count – количество просмотров
   * @param {Date} lastWatchedAt – дата последнего просмотра
   */
  const toggleFavorite = useCallback(
    async (itemId, libraryId, currentlyFavorite, count, lastWatchedAt) => {
      if (!itemId || !libraryId) return;
      const newFavorite = !currentlyFavorite;
      // Оптимистично обновляем UI
      setRawItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isFavorite: newFavorite } : item
        )
      );
      try {
        if (activeTab === 'videos') {
          await updateVideoFromLibrary(libraryId, {
            isFavorite: newFavorite,
            viewCount: count,
            lastWatchedAt,
          });
        } else if (activeTab === 'tracks') {
          await updateTrackFromLibrary(libraryId, {
            isFavorite: newFavorite,
            playCount: count,
          });
        }
      } catch (err) {
        // Откат
        setRawItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, isFavorite: currentlyFavorite }
              : item
          )
        );
        console.error('Ошибка избранного:', err);
      }
    },
    [activeTab, setRawItems]
  );

  /**
   * Обновление счетчика комментариев к карточки.
   * @param {number} itemId – ID сущности.
   * @param {number} delta – изменение счетчика.
   */
  const updateCommentCount = useCallback(
    (itemId, delta) => {
      setRawItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, commentsCount: (item.commentsCount ?? 0) + delta }
            : item
        )
      );
    },
    [setRawItems]
  );

  return {
    toggleLikeItem,
    removeItemOptimistic,
    addItemOptimistic,
    updateItemCount,
    toggleFavorite,
    updateCommentCount,
  };
}
