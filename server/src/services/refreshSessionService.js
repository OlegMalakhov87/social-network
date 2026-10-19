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
   * @returns {Promise<{refreshToken: string, expiresAt: Date}>}
   */
  async create(userId, { transaction } = {}) {
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await RefreshSession.create(
      {
        userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt,
      },
      { transaction }
    );

    return { refreshToken, expiresAt };
  },

  /**
   * Ротация refresh token с обнаружением повторного использования.
   * @param {string} refreshToken
   * @returns {Promise<{userId: number, refreshToken: string, expiresAt: Date}>}
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
   * Отзыв refresh-сессии по текущему refresh token.
   *
   * @param {string} refreshToken
   * @returns {Promise<boolean>}
   */
  async revoke(refreshToken) {
    if (
      typeof refreshToken !== 'string' ||
      !/^[a-f0-9]{64}$/.test(refreshToken)
    ) {
      return false;
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const deletedCount = await RefreshSession.destroy({
      where: { tokenHash },
    });

    return deletedCount > 0;
  },
};

module.exports = refreshSessionService;
