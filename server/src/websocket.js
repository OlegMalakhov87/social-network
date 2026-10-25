const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { RefreshSession } = require('../db/models');

const clients = new Map();

const AUTH_TIMEOUT_MS = 5000; // Ограничивает ожидание авторизации пятью секундами.
const SESSION_CHECK_INTERVAL_MS = 10000; // Проверяет сессии каждые 10 секунд.

/**
 * Проверяет поля маркера доступа.
 *
 * @param {Object} claims - Поля маркера доступа
 * @returns {boolean} Результат проверки.
 */
const isValidClaims = (claims) =>
  Number.isSafeInteger(claims?.id) &&
  claims.id > 0 &&
  typeof claims.sid === 'string' &&
  /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(claims.sid) &&
  Number.isSafeInteger(claims.exp);

/**
 * Удаляет соединение из списка клиентов.
 *
 * @param {WebSocket} ws - Соединение WebSocket
 * @returns {void} Ничего не возвращает.
 */
const removeClient = (ws) => {
  if (!ws.userId) return;

  const sockets = clients.get(ws.userId);
  if (!sockets) return;

  sockets.delete(ws);

  if (sockets.size === 0) {
    clients.delete(ws.userId);
  }
};

/**
 * Настраивает сервер WebSocket.
 *
 * @param {http.Server} server - Сервер HTTP
 * @returns {Object} Объект с WebSocket-сервером и клиентами.
 */
function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    noServer: true,
    maxPayload: 16 * 1024,
    perMessageDeflate: false,
  });

  const allowedOrigin = new URL(
    process.env.CLIENT_URL || 'http://localhost:3000'
  ).origin;

  /**
   * Отклоняет установление соединения.
   *
   * @param {import('net').Socket} socket - Сокет TCP
   * @returns {void} Завершает сокет без соединения.
   */
  const rejectUpgrade = (socket) => {
    socket.write(
      'HTTP/1.1 403 Forbidden\r\n' +
        'Connection: close\r\n' +
        'Content-Length: 0\r\n\r\n'
    );
    socket.destroy();
  };

  /**
   * Проверяет источник до установления соединения WebSocket.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('net').Socket} socket - Сокет TCP
   * @param {Buffer} head - Начало запроса обновления протокола
   * @returns {void} Ничего не возвращает.
   */
  const handleUpgrade = (req, socket, head) => {
    try {
      const url = new URL(req.url, 'http://localhost');

      if (
        req.headers.origin !== allowedOrigin ||
        url.pathname !== '/' ||
        url.search
      ) {
        rejectUpgrade(socket);
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } catch {
      rejectUpgrade(socket);
    }
  };

  server.on('upgrade', handleUpgrade);

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    let authenticating = false;
    let authenticated = false;

    // Не позволяет держать неавторизованное соединение бесконечно.
    const authTimeout = setTimeout(() => {
      if (!authenticated) {
        ws.close(4001, 'Требуется авторизация');
      }
    }, AUTH_TIMEOUT_MS);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (raw, isBinary) => {
      // Пока авторизации нет, принимает только одно auth-сообщение.
      if (!authenticated) {
        if (authenticating || isBinary) {
          ws.close(4004, 'Недопустимое сообщение');
          return;
        }

        authenticating = true;

        try {
          const message = JSON.parse(raw.toString());

          if (message?.type !== 'auth' || typeof message.token !== 'string') {
            ws.close(4004, 'Неверный формат авторизации');
            return;
          }

          let claims;

          try {
            claims = jwt.verify(message.token, process.env.JWT_SECRET, {
              algorithms: ['HS256'],
            });
          } catch (error) {
            ws.close(
              error.name === 'TokenExpiredError' ? 4002 : 4004,
              'Недействительный токен'
            );
            return;
          }

          if (!isValidClaims(claims)) {
            ws.close(4004, 'Некорректный токен');
            return;
          }

          const session = await RefreshSession.findOne({
            where: {
              id: claims.sid,
              userId: claims.id,
              expiresAt: { [Op.gt]: new Date() },
            },
            attributes: ['id'],
          });

          if (!session) {
            ws.close(4003, 'Сессия отозвана');
            return;
          }

          if (
            ws.readyState !== WebSocket.OPEN ||
            claims.exp * 1000 <= Date.now()
          ) {
            ws.close(4002, 'Токен истёк');
            return;
          }

          ws.userId = claims.id;
          ws.sessionId = claims.sid;
          ws.accessExpiresAt = claims.exp * 1000;

          authenticated = true;
          clearTimeout(authTimeout);

          if (!clients.has(ws.userId)) {
            clients.set(ws.userId, new Set());
          }

          clients.get(ws.userId).add(ws);

          ws.send(
            JSON.stringify({
              type: 'authSuccess',
              userId: ws.userId,
            })
          );
        } catch (error) {
          console.error(
            '[WebSocket] Ошибка проверки авторизации:',
            error.message
          );

          ws.close(1011, 'Ошибка сервера');
        } finally {
          authenticating = false;
        }

        return;
      }

      // Оставляет обработку typing и других событий на будущее.
      // Все действия должны дополнительно проверять права пользователя.
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Ошибка соединения:', error.message);
    });
  });

  let checkingSessions = false;

  /**
   * Проверяет срок JWT и действительность серверных сессий.
   *
   * @returns {Promise<void>} Завершает операцию.
   */
  const checkConnections = async () => {
    if (checkingSessions) return;
    checkingSessions = true;

    try {
      const now = Date.now();

      for (const ws of wss.clients) {
        if (ws.readyState !== WebSocket.OPEN) continue;

        if (ws.isAlive === false) {
          ws.terminate();
          continue;
        }

        ws.isAlive = false;
        ws.ping();

        if (ws.userId && ws.accessExpiresAt <= now) {
          ws.close(4002, 'Токен истёк');
        }
      }

      const sockets = [...wss.clients].filter(
        (ws) =>
          ws.readyState === WebSocket.OPEN &&
          ws.userId &&
          ws.accessExpiresAt > now
      );

      if (sockets.length === 0) return;

      const sessionIds = [...new Set(sockets.map((ws) => ws.sessionId))];

      const sessions = await RefreshSession.findAll({
        where: {
          id: { [Op.in]: sessionIds },
          expiresAt: { [Op.gt]: new Date() },
        },
        attributes: ['id', 'userId'],
      });

      const activeSessions = new Set(
        sessions.map((session) => `${session.id}:${session.userId}`)
      );

      for (const ws of sockets) {
        if (
          ws.readyState === WebSocket.OPEN &&
          !activeSessions.has(`${ws.sessionId}:${ws.userId}`)
        ) {
          ws.close(4003, 'Сессия отозвана');
        }
      }
    } catch (error) {
      console.error('[WebSocket] Не удалось проверить сессии:', error.message);

      // При сбое проверки не продолжает доверять старой сессии.
      for (const ws of wss.clients) {
        if (ws.userId && ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Ошибка проверки сессии');
        }
      }
    } finally {
      checkingSessions = false;
    }
  };

  const interval = setInterval(checkConnections, SESSION_CHECK_INTERVAL_MS);

  wss.on('close', () => {
    clearInterval(interval);
    server.off('upgrade', handleUpgrade);
  });

  return { wss, clients };
}

/**
 * Отправляет уведомление через действующие сессии.
 *
 * @param {number} userId - Идентификатор пользователя
 * @param {Object} payload - Данные уведомления
 * @returns {Promise<Object>} Результат операции.
 */
async function notifyUser(userId, payload) {
  const sockets = [...(clients.get(userId) ?? [])].filter(
    (ws) => ws.readyState === WebSocket.OPEN
  );

  if (sockets.length === 0) return;

  try {
    const now = Date.now();

    const validCandidates = sockets.filter((ws) => {
      if (ws.accessExpiresAt > now) return true;

      ws.close(4002, 'Токен истёк');
      return false;
    });

    if (validCandidates.length === 0) return;

    const sessions = await RefreshSession.findAll({
      where: {
        id: {
          [Op.in]: [...new Set(validCandidates.map((ws) => ws.sessionId))],
        },
        userId,
        expiresAt: { [Op.gt]: new Date() },
      },
      attributes: ['id'],
    });

    const activeIds = new Set(sessions.map((session) => session.id));
    const data = JSON.stringify(payload);

    for (const ws of validCandidates) {
      if (ws.readyState !== WebSocket.OPEN) continue;

      if (!activeIds.has(ws.sessionId)) {
        ws.close(4003, 'Сессия отозвана');
        continue;
      }

      if (ws.accessExpiresAt <= Date.now()) {
        ws.close(4002, 'Токен истёк');
        continue;
      }

      ws.send(data);
    }
  } catch (error) {
    console.error(
      '[WebSocket] Не удалось отправить уведомление:',
      error.message
    );
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1011, 'Не удалось проверить сессию');
      }
    }
  }
}

module.exports = { setupWebSocket, notifyUser, clients };
