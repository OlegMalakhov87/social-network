import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { selectUser } from '../../../entities/auth';
import {
  fetchMessagesApi,
  markMessagesAsRead,
  normalizeMessages,
  subscribeNewMessage,
} from '../../../entities/dialog';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticLike,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает сообщения выбранного диалога и обновляет их локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {number|null} [params.partnerId=null] - Идентификатор собеседника
 * @returns {{
 *   messages: Array<Object>,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function,
 *   addOptimistic: Function,
 *   replaceOptimistic: Function,
 *   removeOptimistic: Function,
 *   updateMessageInState: Function,
 *   markAsRead: Function,
 *   toggleLike: Function
 * }} Сообщения диалога и действия
 */
export function useMessages({ partnerId = null }) {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  // Запоминает уже отправленные отметки прочтения.
  const readIdsRef = useRef(new Set());

  const scrollDeps = useMemo(
    () => [currentUserId, partnerId],
    [currentUserId, partnerId]
  );

  const {
    items: messagesItems,
    setItems: setMessagesItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    /**
     * Загружает страницу сообщений.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница сообщений
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUserId || !partnerId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchMessagesApi, {
        params: { partnerId, page, limit },
        signal,
      });
    },
    deps: scrollDeps,
  });

  // Подписывается на новые сообщения. Соединение WebSocket держит приложение.
  useEffect(() => {
    if (!currentUserId || !partnerId) {
      return;
    }

    return subscribeNewMessage((msg) => {
      const belongsToCurrentDialog =
        (msg.senderId === partnerId && msg.receiverId === currentUserId) ||
        (msg.receiverId === partnerId && msg.senderId === currentUserId);

      if (!belongsToCurrentDialog) return;

      setMessagesItems((prev) => {
        if (prev.some((message) => message.id === msg.id)) {
          return prev;
        }

        return [msg, ...prev];
      });
    });
  }, [currentUserId, partnerId, setMessagesItems]);

  /**
   * Добавляет сообщение в список до ответа сервера.
   *
   * @param {Object} msg - Сообщение
   * @returns {void}
   */
  const addOptimistic = useCallback(
    (msg) => {
      setMessagesItems((prev) => [msg, ...prev]);
    },
    [setMessagesItems]
  );

  /**
   * Заменяет временное сообщение ответом сервера или удаляет его.
   *
   * @param {string|number} tempId - Временный идентификатор
   * @param {Object|null} realMsg - Сообщение сервера или null для удаления
   * @returns {void}
   */
  const replaceOptimistic = useCallback(
    (tempId, realMsg) => {
      setMessagesItems((prev) =>
        realMsg === null
          ? prev.filter((m) => m.id !== tempId)
          : prev.map((m) => (m.id === tempId ? { ...m, ...realMsg } : m))
      );
    },
    [setMessagesItems]
  );

  /**
   * Удаляет сообщение из списка до ответа сервера.
   *
   * @param {number|string} messageId - Идентификатор сообщения
   * @returns {void}
   */
  const removeOptimistic = useCallback(
    (messageId) => {
      setMessagesItems((prev) => prev.filter((m) => m.id !== messageId));
    },
    [setMessagesItems]
  );

  const markAsRead = useCallback(async () => {
    const unreadIds = messagesItems
      .filter(
        (m) =>
          m.senderId === partnerId &&
          m.receiverId === currentUserId &&
          !m.isRead &&
          !readIdsRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => readIdsRef.current.add(id));

    try {
      await markMessagesAsRead(unreadIds);
      setMessagesItems((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      // Откатывает отметку, если сервер не подтвердил прочтение.
      unreadIds.forEach((id) => readIdsRef.current.delete(id));
      console.error('Ошибка отметки прочтения:', err);
    }
  }, [messagesItems, setMessagesItems, partnerId, currentUserId]);

  /**
   * Обновляет отдельные поля сообщения.
   *
   * @param {number|string} messageId - Идентификатор сообщения
   * @param {Object} updates - Поля для обновления
   * @returns {void}
   */
  const updateMessageInState = useCallback(
    (messageId, updates) => {
      setMessagesItems((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      );
    },
    [setMessagesItems]
  );

  const toggleLike = useOptimisticLike({
    setItems: setMessagesItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUserId,
    targetType: 'messages',
  });

  const chronologicalMessages = useMemo(
    () => [...messagesItems].reverse(),
    [messagesItems]
  );

  const normalizedMessages = useNormalizedData({
    items: chronologicalMessages,
    normalizeFn: normalizeMessages,
  });

  return {
    messages: normalizedMessages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    replaceOptimistic,
    updateMessageInState,
    markAsRead,
    addOptimistic,
    removeOptimistic,
    toggleLike,
  };
}
