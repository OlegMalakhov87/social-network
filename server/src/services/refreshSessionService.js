const { randomBytes, createHash } = require('node:crypto');

const {
  sequelize,
  RefreshSession,
  UsedRefreshToken,
} = require('../../db/models');
const { createError } = require('../utils/createError');
const { REFRESH_TOKEN_TTL_MS } = require('../../config/authConfig');

/**
 * Создает криптографически стойкий маркер обновления.
 *
 * @returns {string} Строковый результат.
 */
const generateRefreshToken = () => {
  return randomBytes(32).toString('hex');
};

/**
 * Создает хеш SHA-256 маркера обновления.
 *
 * @param {string} token - Маркер обновления
 * @returns {string} Строковый результат.
 */
const hashRefreshToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

const refreshSessionService = {
  /**
   * Создает сессию обновления.
   *
   * @param {number} userId - Идентификатор пользователя
   * @param {Object} [options={}] - Параметры вызова
   * @param {import('sequelize').Transaction} [options.transaction] - Транзакция Sequelize
   * @returns {Promise<{
   *   sessionId: string,
   *   refreshToken: string,
   *   expiresAt: Date
   * }>} Идентификатор сессии, маркер и срок действия.
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
   * Заменяет маркер обновления и обнаруживает повторное использование.
   *
   * @param {string} refreshToken - Маркер обновления
   * @returns {Promise<{
   *   sessionId: string,
   *   userId: number,
   *   refreshToken: string,
   *   expiresAt: Date
   * }>} Новая сессия после замены маркера.
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
      // Блокирует найденную сессию до завершения транзакции.
      const session = await RefreshSession.findOne({
        where: { tokenHash: oldHash },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (session) {
        // Абсолютный срок сессии не продлевает.
        if (session.expiresAt <= new Date()) {
          return { status: 'invalid' };
        }

        const newRefreshToken = generateRefreshToken();

        // Сначала сохраняет историю старого токена.
        await UsedRefreshToken.create(
          {
            sessionId: session.id,
            tokenHash: oldHash,
          },
          { transaction }
        );

        // Затем заменяет действительный токен новым.
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

      // Если активного токена нет, ищет его в истории.
      const usedToken = await UsedRefreshToken.findOne({
        where: { tokenHash: oldHash },
        transaction,
      });

      if (!usedToken) {
        return { status: 'invalid' };
      }

      // Повторно использованный токен отзывает соответствующую сессию.
      const reusedSession = await RefreshSession.findByPk(usedToken.sessionId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (reusedSession) {
        await reusedSession.destroy({ transaction });
      }

      // Ошибку пока не выбрасывает: сначала транзакция должна зафиксировать отзыв.
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
   * Отзывает только ожидаемую сессию обновления.
   *
   * @param {string} refreshToken - Маркер обновления
   * @param {string} expectedSessionId - Ожидаемый идентификатор сессии
   * @returns {Promise<{
   *   revoked: boolean,
   *   reason?: 'SESSION_CHANGED' | 'NOT_FOUND'
   * }>} Признак отзыва и причина отказа.
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

    // Удаляет запись только при совпадении маркера обновления и ожидаемого sessionId.
    const deletedCount = await RefreshSession.destroy({
      where: {
        tokenHash,
        id: expectedSessionId,
      },
    });

    if (deletedCount > 0) {
      return { revoked: true };
    }

    // Если удалить не удалось, выясняет причину.
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
