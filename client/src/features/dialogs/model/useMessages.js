import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { fetchMessages, markMessagesAsRead } from '../../../entities/dialog';
import { normalizeMessage } from '../../../entities/message';

/**
 * Хук для работы с сообщениями выбранного диалога.
 * Предоставляет оптимистичное добавление, замену, удаление,
 * отметку прочтения и обновление отдельных полей сообщений.
 *
 * @param {number|null} partnerId – ID собеседника
 * @returns {{
 *   messages: Array,
 *   isLoading: boolean,
 *   error: string|null,
 *   addOptimistic: (msg: Object) => void,
 *   replaceOptimistic: (tempId: string|number, realMsg: Object) => void,
 *   removeOptimistic: (messageId: number) => void,
 *   updateMessageInState: (messageId: number, updates: Object) => void,
 *   markAsRead: () => Promise<void>,
 *   refetch: () => Promise<void>
 * }}
 */
export function useMessages(partnerId) {
  const [rawMessages, setRawMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);

  // Загрузка истории сообщений
  const loadMessages = useCallback(async () => {
    if (!currentUserId || !partnerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMessages(partnerId);
      setRawMessages(data.messages || []);
    } catch (err) {
      setError('Ошибка загрузки сообщений:', err.message);
      setRawMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, partnerId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // WebSocket: получение новых сообщений в реальном времени
  useEffect(() => {
    if (!currentUserId || !token) return;
    const ws = new WebSocket('ws://localhost:5000');
    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new message') {
        const msg = data.message;
        if (
          (msg.senderId === partnerId && msg.receiverId === currentUserId) ||
          (msg.receiverId === partnerId && msg.senderId === currentUserId)
        ) {
          setRawMessages((prev) => [...prev, msg]);
        }
      }
    };
    return () => ws.close();
  }, [currentUserId, token, partnerId]);

  /**
   * Оптимистично добавить сообщение в локальный стейт.
   * @param {Object} msg – объект сообщения
   */
  const addOptimistic = useCallback((msg) => {
    setRawMessages((prev) => [...prev, msg]);
  }, []);

  /**
   * Заменить временное сообщение реальным (или удалить при ошибке).
   * @param {string|number} tempId – временный ID
   * @param {Object|null} realMsg – реальный объект сообщения или null для удаления
   */
  const replaceOptimistic = useCallback((tempId, realMsg) => {
    setRawMessages((prev) =>
      realMsg === null
        ? prev.filter((m) => m.id !== tempId)
        : prev.map((m) => (m.id === tempId ? { ...m, ...realMsg } : m))
    );
  }, []);

  /**
   * Удалить сообщение из локального стейта (оптимистично).
   * @param {number} messageId – ID сообщения
   */
  const removeOptimistic = useCallback((messageId) => {
    setRawMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  /**
   * Отметить все непрочитанные входящие сообщения как прочитанные.
   */
  const markAsRead = useCallback(async () => {
    const unreadIds = rawMessages
      .filter((m) => m.senderId === partnerId && m.receiverId === currentUserId && !m.isRead)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    try {
      await markMessagesAsRead(unreadIds);
      setRawMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      console.error('Ошибка отметки прочтения:', err);
    }
  }, [rawMessages, partnerId, currentUserId]);

  /**
   * Обновить отдельные поля сообщения (например, после редактирования).
   * @param {number} messageId – ID сообщения
   * @param {Object} updates – поля для обновления
   */
  const updateMessageInState = useCallback((messageId, updates) => {
    setRawMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m)));
  }, []);

  // Нормализуем сообщения перед передачей в компоненты
  const messages = useMemo(() => rawMessages.map(normalizeMessage), [rawMessages]);

  return {
    messages,
    isLoading,
    error,
    replaceOptimistic,
    updateMessageInState,
    markAsRead,
    addOptimistic,
    removeOptimistic,
    refetch: loadMessages,
  };
}
