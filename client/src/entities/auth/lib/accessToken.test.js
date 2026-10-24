import { getAccessTokenClaims } from './accessToken';

/**
 * Создаёт тестовый токен.
 * @param {Object} payload - полезная нагрузка токена
 * @returns {string} - тестовый токен
 */
const createTestToken = (payload) => {
  const header = btoa(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  );

  const body = btoa(JSON.stringify(payload));

  return `${header}.${body}.test-signature`;
};

/**
 * Тестирует функцию getAccessTokenClaims.
 */
describe('accessToken', () => {
  /**
   * Настраивает тестовые данные.
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('извлекает id, sid и exp из JWT', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;

    const token = createTestToken({
      id: 15,
      sid: 'session-123',
      exp,
    });

    expect(getAccessTokenClaims(token)).toEqual({
      id: 15,
      sid: 'session-123',
      exp,
    });
  });

  test('отклоняет некорректный JWT', () => {
    expect(getAccessTokenClaims('invalid-token')).toBeNull();

    expect(getAccessTokenClaims(null)).toBeNull();

    expect(
      getAccessTokenClaims(
        createTestToken({
          id: 15,
          exp: 123456,
        })
      )
    ).toBeNull();
  });
});
