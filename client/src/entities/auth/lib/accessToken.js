/**
 * Извлекает необходимые поля access JWT.
 *
 * ВАЖНО: декодирование не проверяет подпись токена.
 *
 * @param {string} token
 * @returns {{ id: number, sid: string, exp: number } | null}
 */
export const getAccessTokenClaims = (token) => {
  if (typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

    const payload = JSON.parse(atob(base64));

    if (
      !payload ||
      typeof payload !== 'object' ||
      !Number.isSafeInteger(payload.id) ||
      payload.id <= 0 ||
      typeof payload.sid !== 'string' ||
      !payload.sid ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp)
    ) {
      return null;
    }

    return {
      id: payload.id,
      sid: payload.sid,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};
