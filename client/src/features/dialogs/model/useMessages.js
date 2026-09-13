import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../../../entities/auth';
import {
  fetchMessagesApi,
  markMessagesAsRead,
  normalizeMessages,
} from '../../../entities/dialog';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import { WS_URL } from '../../../shared/config';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticLike,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для работы с сообщениями выбранного диалога.
 * Предоставляет оптимистичное добавление, замену, удаление,
 * отметку прочтения и обновление отдельных полей сообщений.
 *
 * @param {number|null} userId – ID собеседника
 * @returns { Object } - объект с данными о сообщениях
 */
export function useMessages(userId) {
  const currentUser = useSelector(selectUser);
  const token = useSelector(selectToken);
  const currentUserId = currentUser?.id;

  /** Хранение ID прочитанных сообщений.*/
  const readIdsRef = useRef(new Set());

  /** Зависимости для бесконечного скролла */
  const scrollDeps = useMemo(
    () => [currentUserId, userId],
    [currentUserId, userId]
  );

  /** Получение сообщений с бесконечным скроллом. */
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
      if (!currentUserId || !userId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchMessagesApi, {
        params: { userId, page, limit },
        signal,
      });
    },
    deps: scrollDeps,
    options: {
      autoFetch: Boolean(currentUserId),
    },
    initialData: {
      items: [],
      hasMore: false,
    },
  });

  /** WebSocket: получение новых сообщений в реальном времени. */
  useEffect(() => {
    if (!currentUserId || !token || !userId) return;

    let ws;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    const connect = () => {
      const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectAttempts = 0;
      };

      ws.onerror = (event) => {
        console.error('Ошибка WebSocket соединения:', event);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'newMessage') {
            const msg = data.data;
            if (
              (msg.senderId === userId && msg.receiverId === currentUserId) ||
              (msg.receiverId === userId && msg.senderId === currentUserId)
            ) {
              setMessagesItems((prev) => [...prev, msg]);
            }
          }
        } catch (err) {
          console.error('Ошибка обработки сообщения WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(
          `WebSocket закрыт. Код: ${event.code}, Причина: ${event.reason}`
        );

        // Не пытаемся переподключиться, если сервер нас специально выгнал (неверный токен)
        if (event.code === 4001 || event.code === 4002) {
          console.error(
            'Ошибка аутентификации WebSocket. Переподключение остановлено.'
          );
          return;
        }

        // Защита от "шторма" переподключений (экспоненциальная задержка + jitter)
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts += 1;
          const delay =
            Math.min(1000 * 2 ** reconnectAttempts, 10000) +
            Math.random() * 1000;

          reconnectTimeout = setTimeout(() => {
            console.log(
              `Попытка переподключения WebSocket (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
            );
            connect();
          }, delay);
        } else {
          console.error(
            'Превышено максимальное количество попыток переподключения WebSocket.'
          );
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [currentUserId, userId, setMessagesItems, token]);

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
      //Откат изменений при ошибке
      unreadIds.forEach((id) => readIdsRef.current.delete(id));
      console.error('Ошибка отметки прочтения:', err);
    }
  }, [messagesItems, setMessagesItems, userId, currentUserId]);

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
    currentUserId: currentUserId,
    targetType: 'messages',
  });

  /** Нормализация сообщений. */
  const normalizedMessages = useNormalizedData({
    items: messagesItems,
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
