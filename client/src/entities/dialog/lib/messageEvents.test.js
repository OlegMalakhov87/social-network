import {
  publishNewMessage,
  subscribeNewMessage,
} from './messageEvents';

describe('messageEvents', () => {
  test('передаёт сообщение всем подписчикам', () => {
    const first = jest.fn();
    const second = jest.fn();
    const unsubscribeFirst = subscribeNewMessage(first);
    const unsubscribeSecond = subscribeNewMessage(second);
    const message = { id: 10, content: 'Привет' };

    try {
      publishNewMessage(message);

      expect(first).toHaveBeenCalledWith(message);
      expect(second).toHaveBeenCalledWith(message);
    } finally {
      unsubscribeFirst();
      unsubscribeSecond();
    }
  });

  test('после отписки больше не получает события', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeNewMessage(listener);

    unsubscribe();
    publishNewMessage({ id: 20 });

    expect(listener).not.toHaveBeenCalled();
  });

  test('ошибка одного подписчика не блокирует остальных', () => {
    const logger = jest.spyOn(console, 'error').mockImplementation(() => {});
    const failing = jest.fn(() => {
      throw new Error('Ошибка подписчика');
    });
    const healthy = jest.fn();
    const unsubscribeFailing = subscribeNewMessage(failing);
    const unsubscribeHealthy = subscribeNewMessage(healthy);

    try {
      publishNewMessage({ id: 30 });

      expect(failing).toHaveBeenCalledTimes(1);
      expect(healthy).toHaveBeenCalledWith({ id: 30 });
      expect(logger).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribeFailing();
      unsubscribeHealthy();
      logger.mockRestore();
    }
  });
});
