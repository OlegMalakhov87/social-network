import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { fetchNews, normalizeNews, incrementNewsView } from '../../../entities/news';
import { addLike, deleteLike } from '../../../entities/like';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для получения и фильтрации новостей.
 * @param {Object} filters
 * @param {string} [filters.filter] - категория
 * @param {string} [filters.searchQuery] - поисковый запрос
 * @param {string} [filters.sortKey] - ключ сортировки
 * @returns {{ news: Array, isLoading: boolean, error: string|null, refetch: Function }}
 */
export function useNews({ filter, searchQuery, sortKey } = {}) {
  const [rawNews, setRawNews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const currentUser = useSelector((state) => state.auth?.user);

  const loadNews = useCallback(async (category, query) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchNews({ category, q: query?.trim() || undefined });
      const news = Array.isArray(data?.news) ? data.news : [];
      const newsWithCount = news.map((news) => ({
        ...news,
        commentsCount: news.comments?.length ?? 0,
      }));
      setRawNews(newsWithCount || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      setRawNews([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // При изменении фильтра сразу загружаем
  useEffect(() => {
    loadNews(filter, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // При изменении searchQuery делаем debounce (400 мс)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadNews(filter, searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Нормализация и сортировка на клиенте
  const news = useMemo(() => {
    if (!Array.isArray(rawNews)) return [];
    const normalized = rawNews.map((item) => normalizeNews(item, currentUser?.id));
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return normalized;
    return sortByData(normalized, sortConfig, 'News');
  }, [rawNews, currentUser?.id, sortKey]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} newsId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeNews = useCallback(
    async (newsId, currentlyLiked) => {
      setRawNews((prev) =>
        prev.map((news) =>
          news.id === newsId
            ? {
                ...news,
                likes: currentlyLiked
                  ? (news.likes || []).filter((like) => like.userId !== currentUser?.id)
                  : [...(news.likes || []), { userId: currentUser?.id }],
              }
            : news
        )
      );

      try {
        if (currentlyLiked) {
          await deleteLike('News', newsId);
        } else {
          await addLike('News', newsId);
        }
      } catch (err) {
        setRawNews((prev) =>
          prev.map((news) =>
            news.id === newsId
              ? {
                  ...news,
                  likes: currentlyLiked
                    ? [...(news.likes || []), { userId: currentUser?.id }]
                    : (news.likes || []).filter((like) => like.userId !== currentUser?.id),
                }
              : news
          )
        );
        console.error('Ошибка лайка новости:', err);
      }
    },
    [currentUser?.id]
  );

  /**
   * Оптимистичное обновления счетчика просмотров
   * @param {number} newsId - ID трека
   */
  const incrementViewCount = useCallback(async (newsId) => {
    if (!newsId) return;
    // Оптимистично увеличиваем счётчик
    setRawNews((prev) =>
      prev.map((item) =>
        item.id === newsId ? { ...item, viewCount: (item.viewCount ?? 0) + 1 } : item
      )
    );
    try {
      await incrementNewsView(newsId);
    } catch (err) {
      // Откат при ошибке
      setRawNews((prev) =>
        prev.map((item) =>
          item.id === newsId ? { ...item, viewCount: (item.viewCount ?? 1) - 1 } : item
        )
      );
      console.error('Ошибка инкремента просмотров новости:', err);
    }
  }, []);

  /**
   * Обновление счетчика комментариев к карточке новости.
   * @param {number} newsId – ID новости
   * @param {number} delta
   */
  const updateCommentCount = useCallback((newsId, delta) => {
    setRawNews((prev) =>
      prev.map((news) =>
        news.id === newsId ? { ...news, commentsCount: (news.commentsCount ?? 0) + delta } : news
      )
    );
  }, []);

  return {
    news,
    paginationNews: pagination,
    isLoadingNews: isLoading,
    errorNews: error,
    toggleLikeNews,
    incrementViewCount,
    updateCommentCount,
  };
}
