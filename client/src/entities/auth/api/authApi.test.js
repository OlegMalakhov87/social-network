import { authAxios } from '../../../shared/api/authAxios';
import { refreshAuth } from './authApi';

// Подменяем HTTP-клиент, чтобы тесты не обращались
// к настоящему backend.
jest.mock('../../../shared/api/authAxios', () => ({
  authAxios: {
    post: jest.fn(),
  },
}));

/**
 * Promise, завершением которого управляет сам тест.
 */
const createDeferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('параллельные вызовы refreshAuth используют один HTTP-запрос', async () => {
  const deferred = createDeferred();

  authAxios.post.mockReturnValue(deferred.promise);

  const first = refreshAuth();
  const second = refreshAuth();
  const third = refreshAuth();

  expect(authAxios.post).toHaveBeenCalledTimes(1);
  expect(authAxios.post).toHaveBeenCalledWith('/auth/refresh');

  deferred.resolve({
    data: { token: 'new-access-token' },
  });

  const results = await Promise.all([first, second, third]);

  expect(results).toEqual([
    { token: 'new-access-token' },
    { token: 'new-access-token' },
    { token: 'new-access-token' },
  ]);

  expect(authAxios.post).toHaveBeenCalledTimes(1);
});

test('после успешного refresh следующий вызов создаёт новый запрос', async () => {
  authAxios.post
    .mockResolvedValueOnce({
      data: { token: 'first-access-token' },
    })
    .mockResolvedValueOnce({
      data: { token: 'second-access-token' },
    });

  const first = await refreshAuth();
  const second = await refreshAuth();

  expect(first.token).toBe('first-access-token');
  expect(second.token).toBe('second-access-token');

  expect(authAxios.post).toHaveBeenCalledTimes(2);
});

test('после ошибки refresh можно выполнить новую попытку', async () => {
  authAxios.post
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce({
      data: { token: 'recovered-access-token' },
    });

  await expect(refreshAuth()).rejects.toThrow('Network error');

  const result = await refreshAuth();

  expect(result.token).toBe('recovered-access-token');
  expect(authAxios.post).toHaveBeenCalledTimes(2);
});
