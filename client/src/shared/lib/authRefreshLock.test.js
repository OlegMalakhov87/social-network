import { withAuthRefreshLock } from './authRefreshLock';

describe('withAuthRefreshLock', () => {
  const originalLocks = navigator.locks;

  afterEach(() => {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: originalLocks,
    });
  });

  test('выполняет операцию через Web Locks API', async () => {
    const request = jest.fn(async (name, options, callback) => {
      return callback();
    });

    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request },
    });

    const operation = jest.fn().mockResolvedValue('success');

    const result = await withAuthRefreshLock(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);

    expect(request).toHaveBeenCalledWith(
      'socialnet:auth-refresh',
      { mode: 'exclusive' },
      operation
    );
  });

  test('отклоняет операцию, если Web Locks API недоступен', async () => {
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: undefined,
    });

    const operation = jest.fn();

    await expect(withAuthRefreshLock(operation)).rejects.toThrow(
      'Web Locks API недоступен'
    );

    expect(operation).not.toHaveBeenCalled();
  });
});
