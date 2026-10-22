const { randomBytes, createHash } = require('node:crypto');
const {
  sequelize,
  RefreshSession,
  UsedRefreshToken,
} = require('../../db/models');
const { createError } = require('../utils/createError');
const { REFRESH_TOKEN_TTL_MS } = require('../../config/authConfig');

/**
 * Генерация криптографически стойкого refresh token.
 * @returns {string}
 */
const generateRefreshToken = () => {
  return randomBytes(32).toString('hex');
};

/**
 * Создание SHA-256 хеша refresh token.
 * @param {string} token
 * @returns {string}
 */
const hashRefreshToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

const refreshSessionService = {
  /**
   * Создание пользовательской refresh-сессии.
   *
   * @param {number} userId
   * @param {Object} [options]
   * @param {import('sequelize').Transaction} [options.transaction]
   * @returns {Promise<{
   *   sessionId: string,
   *   refreshToken: string,
   *   expiresAt: Date
   * }>}
   */
  async create(userId, { transaction } = {}) {
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const session = await RefreshSession.create(
      {
        userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt,
      },
      { transaction }
    );

    return { sessionId: session.id, refreshToken, expiresAt };
  },

  /**
   * Ротация refresh token с обнаружением повторного использования.
   *
   * @param {string} refreshToken
   * @returns {Promise<{
   *   sessionId: string,
   *   userId: number,
   *   refreshToken: string,
   *   expiresAt: Date
   * }>}
   */
  async rotate(refreshToken) {
    if (
      typeof refreshToken !== 'string' ||
      !/^[a-f0-9]{64}$/.test(refreshToken)
    ) {
      throw createError(
        'Недействительная сессия',
        401,
        'INVALID_REFRESH_TOKEN'
      );
    }

    const oldHash = hashRefreshToken(refreshToken);

    const result = await sequelize.transaction(async (transaction) => {
      // Блокируем найденную сессию до завершения транзакции.
      const session = await RefreshSession.findOne({
        where: { tokenHash: oldHash },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (session) {
        // Абсолютный срок сессии не продлеваем.
        if (session.expiresAt <= new Date()) {
          return { status: 'invalid' };
        }

        const newRefreshToken = generateRefreshToken();

        // Сначала сохраняем историю старого токена.
        await UsedRefreshToken.create(
          {
            sessionId: session.id,
            tokenHash: oldHash,
          },
          { transaction }
        );

        // Затем заменяем действительный токен новым.
        await session.update(
          {
            tokenHash: hashRefreshToken(newRefreshToken),
          },
          { transaction }
        );

        return {
          status: 'rotated',
          sessionId: session.id,
          userId: session.userId,
          refreshToken: newRefreshToken,
          expiresAt: session.expiresAt,
        };
      }

      // Если активного токена нет, ищем его в истории.
      const usedToken = await UsedRefreshToken.findOne({
        where: { tokenHash: oldHash },
        transaction,
      });

      if (!usedToken) {
        return { status: 'invalid' };
      }

      // Повторно использованный токен:
      // отзываем соответствующую сессию.
      const reusedSession = await RefreshSession.findByPk(usedToken.sessionId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (reusedSession) {
        await reusedSession.destroy({ transaction });
      }

      // Ошибку пока не выбрасываем:
      // сначала транзакция должна зафиксировать отзыв.
      return { status: 'reused' };
    });

    if (result.status === 'rotated') {
      return {
        sessionId: result.sessionId,
        userId: result.userId,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      };
    }

    if (result.status === 'reused') {
      throw createError(
        'Обнаружено повторное использование refresh token',
        401,
        'REFRESH_TOKEN_REUSED'
      );
    }

    throw createError(
      'Недействительная или истекшая сессия',
      401,
      'INVALID_REFRESH_TOKEN'
    );
  },

  /**
   * Отзывает только ожидаемую refresh-сессию.
   *
   * @param {string} refreshToken
   * @param {string} expectedSessionId
   * @returns {Promise<{
   *   revoked: boolean,
   *   reason?: 'SESSION_CHANGED' | 'NOT_FOUND'
   * }>}
   */
  async revoke(refreshToken, expectedSessionId) {
    if (
      typeof refreshToken !== 'string' ||
      !/^[a-f0-9]{64}$/.test(refreshToken)
    ) {
      return {
        revoked: false,
        reason: 'NOT_FOUND',
      };
    }

    const tokenHash = hashRefreshToken(refreshToken);

    // Удаляем запись только при совпадении
    // refresh token и ожидаемого sessionId.
    const deletedCount = await RefreshSession.destroy({
      where: {
        tokenHash,
        id: expectedSessionId,
      },
    });

    if (deletedCount > 0) {
      return { revoked: true };
    }

    // Если удалить не удалось, выясняем причину.
    const currentSession = await RefreshSession.findOne({
      where: { tokenHash },
      attributes: ['id'],
    });

    if (currentSession) {
      return {
        revoked: false,
        reason: 'SESSION_CHANGED',
      };
    }

    return {
      revoked: false,
      reason: 'NOT_FOUND',
    };
  },
};

module.exports = refreshSessionService;
