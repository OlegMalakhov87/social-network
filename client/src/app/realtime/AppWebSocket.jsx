import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  handleWebSocketSessionRevoked,
  refreshWebSocketAccess,
  selectToken,
} from '../../entities/auth';
import { publishNewMessage } from '../../entities/dialog';
import { WS_URL } from '../../shared/config';

const MAX_RECONNECT_ATTEMPTS = 5; // Ограничивает число попыток переподключения.

/**
 * Поддерживает соединение WebSocket авторизованной вкладки.
 *
 * Переподключает соединение при ошибке, обновляет маркер доступа JWT
 * при истечении и завершает сессию, когда её отзывает сервер.
 *
 * @returns {null} Пустая отрисовка.
 */
export function AppWebSocket() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  useEffect(() => {
    if (!token) return;

    let socket = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const ws = new WebSocket(WS_URL);
      socket = ws;

      ws.onopen = () => {
        if (stopped) return;

        ws.send(
          JSON.stringify({
            type: 'auth',
            token,
          })
        );
      };

      /**
       * Обрабатывает сообщение WebSocket.
       *
       * @param {MessageEvent} event - Событие сообщения
       * @returns {void}
       */
      ws.onmessage = (event) => {
        if (stopped) return;

        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'authSuccess':
              reconnectAttempts = 0;
              break;

            case 'new_message':
              if (message.data) {
                publishNewMessage(message.data);
              }
              break;

            default:
              break;
          }
        } catch (error) {
          console.error('Ошибка обработки WebSocket-события:', error);
        }
      };

      ws.onerror = () => {
        if (!stopped) {
          console.error('Ошибка WebSocket-соединения');
        }
      };

      /**
       * Обрабатывает закрытие соединения.
       *
       * @param {CloseEvent} event - Событие закрытия
       * @returns {void}
       */
      ws.onclose = (event) => {
        if (stopped) return;

        // Истекает маркер доступа JWT.
        if (event.code === 4002) {
          dispatch(refreshWebSocketAccess()).catch((error) => {
            console.error('Ошибка обновления авторизации WebSocket:', error);
          });

          return;
        }

        // Отзывает сервер текущую сессию.
        if (event.code === 4003) {
          dispatch(handleWebSocketSessionRevoked(token));
          return;
        }

        // Пропускает переподключение при неисправимой ошибке.
        if (event.code === 4001 || event.code === 4004) {
          return;
        }

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Превышен лимит переподключений WebSocket');
          return;
        }

        reconnectAttempts += 1;

        const delay =
          Math.min(1000 * 2 ** reconnectAttempts, 10000) + Math.random() * 1000;

        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token, dispatch]);

  return null;
}
