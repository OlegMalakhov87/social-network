import { act, cleanup, render } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  handleWebSocketSessionRevoked,
  refreshWebSocketAccess,
} from '../../entities/auth';
import { publishNewMessage } from '../../entities/dialog';
import { AppWebSocket } from './AppWebSocket';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../entities/auth', () => ({
  selectToken: (state) => state.auth.token,
  refreshWebSocketAccess: jest.fn(() => ({ type: 'test/wsRefresh' })),
  handleWebSocketSessionRevoked: jest.fn((token) => ({
    type: 'test/wsRevoked',
    payload: token,
  })),
}));

jest.mock('../../entities/dialog', () => ({
  publishNewMessage: jest.fn(),
}));

jest.mock('../../shared/config', () => ({
  WS_URL: 'ws://localhost:5000',
}));

class MockWebSocket {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.send = jest.fn();
    this.close = jest.fn(() => {
      this.onclose?.({ code: 1000 });
    });
    MockWebSocket.instances.push(this);
  }

  emitOpen() {
    this.onopen?.();
  }

  emitMessage(message) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  emitClose(code) {
    this.onclose?.({ code });
  }
}

describe('AppWebSocket', () => {
  const OriginalWebSocket = global.WebSocket;
  let token;
  let dispatch;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    MockWebSocket.instances = [];
    global.WebSocket = MockWebSocket;

    token = 'access-A';
    dispatch = jest.fn(() => Promise.resolve());

    useDispatch.mockReturnValue(dispatch);

    useSelector.mockImplementation((selector) => selector({ auth: { token } }));

    // Восстанавливаем реализации моков перед каждым тестом.
    refreshWebSocketAccess.mockImplementation(() => ({
      type: 'test/wsRefresh',
    }));

    handleWebSocketSessionRevoked.mockImplementation((token) => ({
      type: 'test/wsRevoked',
      payload: token,
    }));
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    global.WebSocket = OriginalWebSocket;
  });

  test('не подключается, если access JWT отсутствует', () => {
    token = null;

    render(<AppWebSocket />);

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  test('создаёт WebSocket без JWT в URL и отправляет JWT первым сообщением', () => {
    render(<AppWebSocket />);
    const ws = MockWebSocket.instances[0];

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(ws.url).toBe('ws://localhost:5000');
    expect(ws.url).not.toContain('token=');

    act(() => ws.emitOpen());

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'auth', token: 'access-A' })
    );
  });

  test('публикует new_message через общий канал событий', () => {
    render(<AppWebSocket />);
    const ws = MockWebSocket.instances[0];
    const message = { id: 15, senderId: 1, receiverId: 2 };

    act(() => ws.emitMessage({ type: 'new_message', data: message }));

    expect(publishNewMessage).toHaveBeenCalledTimes(1);
    expect(publishNewMessage).toHaveBeenCalledWith(message);
  });

  test('при смене JWT закрывает старое соединение и создаёт новое', () => {
    const { rerender } = render(<AppWebSocket />);
    const oldSocket = MockWebSocket.instances[0];

    token = 'access-B';
    rerender(<AppWebSocket />);

    expect(oldSocket.close).toHaveBeenCalledTimes(1);
    expect(MockWebSocket.instances).toHaveLength(2);

    const newSocket = MockWebSocket.instances[1];
    act(() => newSocket.emitOpen());

    expect(newSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'auth', token: 'access-B' })
    );
  });

  test('при закрытии 4002 запрашивает refresh через Redux thunk', () => {
    render(<AppWebSocket />);

    act(() => MockWebSocket.instances[0].emitClose(4002));

    expect(refreshWebSocketAccess).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'test/wsRefresh' });
  });

  test('при закрытии 4003 обрабатывает отзыв текущей сессии', () => {
    render(<AppWebSocket />);

    act(() => MockWebSocket.instances[0].emitClose(4003));

    expect(handleWebSocketSessionRevoked).toHaveBeenCalledWith('access-A');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'test/wsRevoked',
      payload: 'access-A',
    });
  });

  test('при временном сбое переподключается с задержкой', () => {
    render(<AppWebSocket />);

    act(() => {
      MockWebSocket.instances[0].emitClose(1006);
      jest.advanceTimersByTime(4000);
    });

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  test('после размонтирования не переподключается', () => {
    const { unmount } = render(<AppWebSocket />);
    const ws = MockWebSocket.instances[0];

    unmount();

    expect(ws.close).toHaveBeenCalledTimes(1);

    act(() => {
      ws.emitClose(1006);
      jest.advanceTimersByTime(30000);
    });

    expect(MockWebSocket.instances).toHaveLength(1);
  });
});
