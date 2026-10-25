const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { clients } = require('../../src/websocket');
const userService = require('../../src/services/userService');

afterEach(() => {
  clients.clear();
});

const createSocket = (overrides = {}) => ({
  readyState: WebSocket.OPEN,
  accessExpiresAt: Date.now() + 60_000,
  ...overrides,
});

test('checkOnlineBulk распознаёт онлайн-пользователя по числовому ID', async () => {
  clients.set(15, new Set([createSocket()]));

  const result = await userService.checkOnlineBulk([15, 99]);

  assert.deepEqual(result, {
    users: [
      { userId: 15, online: true },
      { userId: 99, online: false },
    ],
  });
});

test('checkOnlineBulk учитывает несколько вкладок одного пользователя', async () => {
  clients.set(15, new Set([
    createSocket({ readyState: WebSocket.CLOSED }),
    createSocket(),
  ]));

  const result = await userService.checkOnlineBulk([15]);

  assert.equal(result.users[0].online, true);
});

test('checkOnlineBulk не считает закрытый или просроченный сокет онлайн', async () => {
  clients.set(15, new Set([
    createSocket({ readyState: WebSocket.CLOSED }),
  ]));
  clients.set(16, new Set([
    createSocket({ accessExpiresAt: Date.now() - 1 }),
  ]));

  const result = await userService.checkOnlineBulk([15, 16]);

  assert.deepEqual(result, {
    users: [
      { userId: 15, online: false },
      { userId: 16, online: false },
    ],
  });
});

test('checkOnlineBulk удаляет повторы и нормализует ID', async () => {
  const result = await userService.checkOnlineBulk([15, '15', 0, -1, 'abc', 16]);

  assert.deepEqual(result.users.map(({ userId }) => userId), [15, 16]);
});

test('checkOnlineBulk отклоняет не-массив', async () => {
  await assert.rejects(
    () => userService.checkOnlineBulk('15'),
    (error) => error.status === 400 || error.statusCode === 400
  );
});
