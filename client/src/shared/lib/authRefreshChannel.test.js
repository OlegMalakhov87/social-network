import { createAuthRefreshChannel } from './authRefreshChannel';

describe('createAuthRefreshChannel', () => {
  const originalBroadcastChannel = global.BroadcastChannel;

  let mockChannel;

  beforeEach(() => {
    mockChannel = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    };

    global.BroadcastChannel = jest.fn(() => mockChannel);
  });

  afterEach(() => {
    global.BroadcastChannel = originalBroadcastChannel;
    jest.clearAllMocks();
  });

  test('создаёт канал с правильным именем', () => {
    const channel = createAuthRefreshChannel();

    expect(global.BroadcastChannel).toHaveBeenCalledWith(
      'socialnet:auth-session'
    );

    channel.close();
  });

  test('отправляет сообщение', () => {
    const channel = createAuthRefreshChannel();

    const message = {
      type: 'REFRESH_COMPLETED',
      token: 'new-access-token',
    };

    channel.publish(message);

    expect(mockChannel.postMessage).toHaveBeenCalledWith(message);

    channel.close();
  });

  test('подписывается на сообщения и позволяет отписаться', () => {
    const channel = createAuthRefreshChannel();
    const callback = jest.fn();

    const unsubscribe = channel.subscribe(callback);

    expect(mockChannel.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    );

    const handler = mockChannel.addEventListener.mock.calls[0][1];

    handler({
      data: { type: 'REFRESH_COMPLETED' },
    });

    expect(callback).toHaveBeenCalledWith({
      type: 'REFRESH_COMPLETED',
    });

    unsubscribe();

    expect(mockChannel.removeEventListener).toHaveBeenCalledWith(
      'message',
      handler
    );

    channel.close();

    expect(mockChannel.close).toHaveBeenCalledTimes(1);
  });
});
