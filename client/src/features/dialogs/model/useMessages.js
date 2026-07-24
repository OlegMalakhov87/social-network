import { useCallback, useEffect, useRef } from 'react';
import {
  selectToken,
  selectUser,
} from '../../../app/providers/slices/auth/authSelectors';
import { fetchMessagesApi, markMessagesAsRead } from '../../../entities/dialog';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import { normalizeMessage } from '../../../entities/message';
import { API_URL } from '../../../shared/config';
import {
  useInfiniteScroll,
  useNotify,
  useOptimisticLike,
} from '../../../shared/hooks';
import { apiFetchItems, useNormalizedData } from '../../../shared/lib';

/**
 * Хук для работы с сообщениями выбранного диалога.
 * Предоставляет оптимистичное добавление, замену, удаление,
 * отметку прочтения и обновление отдельных полей сообщений.
 *
 * @param {number|null} userId – ID собеседника
 * @returns { Object } { messages, isLoading, isLoadingMore, hasMore, error, loadMore, refetch, replaceOptimistic, updateMessageInState, markAsRead, addOptimistic, removeOptimistic }
 */
export function useMessages(userId) {
  const currentUser = selectUser();
  const token = selectToken();
  const notify = useNotify('dialogs');
  const readIdsRef = useRef(new Set());

  /** Получение новостей с бесконечным скроллом. */
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
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUser?.id || !userId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchMessagesApi, {
        params: { userId, page, limit },
        signal,
      });
    },
    deps: [currentUser?.id, userId],
    options: {
      autoFetch: true,
      onSuccess: () => notify.success('load'),
      onError: () => notify.error('load'),
    },
  });

  /** WebSocket: получение новых сообщений в реальном времени. */
  useEffect(() => {
    if (!currentUser?.id || !token || !userId) return;

    let ws;
    let reconnectTimeout;

    const connect = () => {
      ws = new WebSocket(API_URL);

      ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'newMessage') {
        const msg = data.message;
        if (
          (msg.senderId === userId && msg.receiverId === currentUser?.id) ||
          (msg.receiverId === userId && msg.senderId === currentUser?.id)
        ) {
          setMessagesItems((prev) => [...prev, msg]);
        }
      }
    };

    ws.onclose = () => {
      // Переподключение через 3 секунды
      reconnectTimeout = setTimeout(connect, 3000);
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [currentUser?.id, userId, setMessagesItems, token]);

  /**
   * Оптимистичное добавление сообщения.
   * @param {Object} msg – объект сообщения
   */
  const addOptimistic = useCallback(
    (msg) => {
      setMessagesItems((prev) => [...prev, msg]);
    },
    [setMessagesItems]
  );

  /**
   * Замена временного сообщения на реальное (или удаление при ошибке).
   * @param {string|number} tempId – временный ID
   * @param {Object|null} realMsg – реальный объект сообщения или null для удаления
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
   * Оптимистичное удаление сообщения.
   * @param {number} messageId – ID сообщения
   */
  const removeOptimistic = useCallback(
    (messageId) => {
      setMessagesItems((prev) => prev.filter((m) => m.id !== messageId));
    },
    [setMessagesItems]
  );

  /**
   * Отметка прочтения всех непрочитанных входящих сообщений.
   */
  const markAsRead = useCallback(async () => {
    const unreadIds = messagesItems
      .filter(
        (m) =>
          m.senderId === userId &&
          m.receiverId === currentUser?.id &&
          !m.isRead &&
          !readIdsRef.current.has(m.id)
      )
      .map((m) => m.id);

    unreadIds.forEach((id) => readIdsRef.current.add(id));

    if (unreadIds.length === 0) return;

    try {
      await markMessagesAsRead(unreadIds);
      setMessagesItems((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      //Откат изменений при ошибке
      unreadIds.forEach((id) => readIdsRef.current.delete(id));
      console.error('Ошибка отметки прочтения:', err);
    }
  }, [messagesItems, setMessagesItems, userId, currentUser?.id]);

  /**
   * Обновление отдельных полей сообщения (например, после редактирования).
   * @param {number} messageId – ID сообщения
   * @param {Object} updates – поля для обновления
   */
  const updateMessageInState = useCallback(
    (messageId, updates) => {
      setMessagesItems((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      );
    },
    [setMessagesItems]
  );

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setMessagesItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUser?.id,
    targetType: 'messages',
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Нормализация сообщений. */
  const messages = useNormalizedData({
    items: messagesItems,
    normalizeFn: normalizeMessage,
    userId: currentUser?.id,
  });

  return {
    messages,
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
