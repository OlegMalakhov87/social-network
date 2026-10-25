import { getAccessTokenClaims } from './accessToken';

/**
 * Создаёт маркер доступа для проверки.
 *
 * @param {Object} payload - Данные JWT
 * @returns {string} Маркер доступа
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

/** Проверяет чтение полей маркера доступа. */
describe('accessToken', () => {
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
