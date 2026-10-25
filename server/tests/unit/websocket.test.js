const {
  test,
  before,
  beforeEach,
  afterEach,
  after,
} = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const { RefreshSession } = require('../../db/models');
const { setupWebSocket, notifyUser, clients } = require('../../src/websocket');

const USER_ID = 15;
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_ORIGIN = 'http://localhost:3000';
const TEST_SECRET = 'local-websocket-test-secret';

const originalFindOne = RefreshSession.findOne;
const originalFindAll = RefreshSession.findAll;
const originalSecret = process.env.JWT_SECRET;
const originalClientUrl = process.env.CLIENT_URL;

let server;
let wss;
let port;
let activeSession;
let openedClients;

const restoreEnv = (key, value) => {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

const makeToken = (expiresIn = '15m') =>
  jwt.sign(
    { id: USER_ID, sid: SESSION_ID },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn }
  );

const connect = async () => {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/`, {
    origin: TEST_ORIGIN,
  });
  openedClients.push(ws);
  await once(ws, 'open');
  return ws;
};

const authenticate = async (ws, token = makeToken()) => {
  const received = once(ws, 'message');
  ws.send(JSON.stringify({ type: 'auth', token }));
  const [raw] = await received;
  return JSON.parse(raw.toString());
};

before(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.CLIENT_URL = TEST_ORIGIN;

  server = http.createServer();
  ({ wss } = setupWebSocket(server));

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});

beforeEach(() => {
  activeSession = true;
  openedClients = [];

  // Мокаем только слой данных, оставляя реальный HTTP/WS handshake.
  RefreshSession.findOne = async () =>
    activeSession ? { id: SESSION_ID, userId: USER_ID } : null;

  RefreshSession.findAll = async () =>
    activeSession ? [{ id: SESSION_ID, userId: USER_ID }] : [];
});

afterEach(async () => {
  const serverSockets = [...wss.clients];
  const closed = serverSockets
    .filter((ws) => ws.readyState !== WebSocket.CLOSED)
    .map((ws) => once(ws, 'close'));

  for (const ws of serverSockets) ws.terminate();
  for (const ws of openedClients) ws.terminate();

  await Promise.allSettled(closed);
  clients.clear();
});

after(async () => {
  await new Promise((resolve) => wss.close(resolve));
  await new Promise((resolve) => server.close(resolve));

  RefreshSession.findOne = originalFindOne;
  RefreshSession.findAll = originalFindAll;
  restoreEnv('JWT_SECRET', originalSecret);
  restoreEnv('CLIENT_URL', originalClientUrl);
});

test('подключение с действующим JWT и сессией получает authSuccess', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  const response = await authenticate(ws);

  assert.deepEqual(response, { type: 'authSuccess', userId: USER_ID });
  assert.equal(clients.get(USER_ID)?.size, 1);
});

test('сервер отклоняет недействительный JWT кодом 4004', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  const closed = once(ws, 'close');

  ws.send(JSON.stringify({ type: 'auth', token: 'invalid-token' }));

  const [code] = await closed;
  assert.equal(code, 4004);
  assert.equal(clients.has(USER_ID), false);
});

test('сервер отклоняет истёкший JWT кодом 4002', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  const closed = once(ws, 'close');

  ws.send(JSON.stringify({ type: 'auth', token: makeToken('-1s') }));

  const [code] = await closed;
  assert.equal(code, 4002);
  assert.equal(clients.has(USER_ID), false);
});

test('сервер отклоняет JWT от отозванной сессии кодом 4003', {
  timeout: 5000,
}, async () => {
  activeSession = false;
  const ws = await connect();
  const closed = once(ws, 'close');

  ws.send(JSON.stringify({ type: 'auth', token: makeToken() }));

  const [code] = await closed;
  assert.equal(code, 4003);
  assert.equal(clients.has(USER_ID), false);
});

test('сервер отклоняет WebSocket с посторонним Origin', {
  timeout: 5000,
}, async () => {
  const status = await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/`, {
      origin: 'https://another-site.example',
    });

    ws.once('unexpected-response', (_request, response) => {
      const code = response.statusCode;
      response.resume();
      ws.terminate();
      resolve(code);
    });
    ws.once('error', reject);
  });

  assert.equal(status, 403);
});

test('notifyUser доставляет new_message действующему соединению', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  await authenticate(ws);

  const notification = {
    type: 'new_message',
    data: { id: 123, senderId: 9, receiverId: USER_ID },
  };

  const received = once(ws, 'message');
  await notifyUser(USER_ID, notification);
  const [raw] = await received;

  assert.deepEqual(JSON.parse(raw.toString()), notification);
});

test('notifyUser не доставляет сообщение после отзыва сессии', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  await authenticate(ws);
  activeSession = false;

  const closed = once(ws, 'close');
  await notifyUser(USER_ID, {
    type: 'new_message',
    data: { id: 555 },
  });

  const [code] = await closed;
  assert.equal(code, 4003);
});

test('два подключения пользователя учитываются отдельно', {
  timeout: 5000,
}, async () => {
  const first = await connect();
  const second = await connect();
  await authenticate(first);
  await authenticate(second);

  assert.equal(clients.get(USER_ID)?.size, 2);

  const closed = once(first, 'close');
  first.close();
  await closed;

  // Серверный обработчик close сработает в том же цикле обработки закрытия.
  assert.equal(clients.get(USER_ID)?.size, 1);
});

test('notifyUser закрывает сокет при недоступной проверке сессии', {
  timeout: 5000,
}, async () => {
  const ws = await connect();
  await authenticate(ws);

  RefreshSession.findAll = async () => {
    throw new Error('Database unavailable');
  };

  const closed = once(ws, 'close');
  await notifyUser(USER_ID, {
    type: 'new_message',
    data: { id: 556 },
  });

  const [code] = await closed;
  assert.equal(code, 1011);
});

test('сервер не принимает JWT в URL WebSocket-подключения', {
  timeout: 5000,
}, async () => {
  const status = await new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/?token=should-not-be-in-url`,
      { origin: TEST_ORIGIN }
    );

    ws.once('unexpected-response', (_request, response) => {
      const code = response.statusCode;
      response.resume();
      ws.terminate();
      resolve(code);
    });
    ws.once('error', reject);
  });

  assert.equal(status, 403);
});
