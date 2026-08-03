const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Хранилище подключений: Map<userId, Set<WebSocket>>
const clients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  // Механизм heartbeat (очистка "зомби" соединений)
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Если клиент не ответил на предыдущий ping, принудительно закрываем соединение
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Проверка каждые 30 секунд

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws, req) => {
    // Аутентификация на этапе рукопожатия (через URL: ws://localhost:5000?token=xxx)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Токен не предоставлен');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Помечаем сокет как "живой" для механизма heartbeat
      ws.isAlive = true;
      ws.userId = userId;

      // Добавляем сокет в Set для конкретного пользователя
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId).add(ws);

      // Обработка ответа на ping от сервера
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Обработка входящих сообщений (если понадобится чат в реальном времени без REST)
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);
          // Здесь можно обрабатывать 'typing' (печатает...) или другие события
        } catch (err) {
          console.error('Ошибка парсинга WS сообщения:', err);
        }
      });

      ws.on('close', () => {
        // Корректная очистка при закрытии
        if (ws.userId && clients.has(ws.userId)) {
          const userSockets = clients.get(ws.userId);
          userSockets.delete(ws);

          // Если это был последний сокет пользователя, удаляем его из Map
          if (userSockets.size === 0) {
            clients.delete(ws.userId);
          }
        }
      });

      ws.send(JSON.stringify({ type: 'authSuccess', userId }));
    } catch (err) {
      // Если токен невалидный или истек, сразу закрываем соединение
      ws.close(4002, 'Недействительный токен');
    }
  });

  return { wss, clients };
}

function notifyUser(userId, payload) {
  const sockets = clients.get(userId);
  if (!sockets) return;

  // Безопасная отправка: проверяем, что сокет открыт (чтобы не отправлять сообщения, если соединение закрыто)
  const data = JSON.stringify(payload);
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
      } catch (err) {
        console.error(`Ошибка отправки сообщения пользователю ${userId}:`, err);
      }
    }
  });
}

module.exports = { setupWebSocket, notifyUser, clients };
