const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { RefreshSession } = require('../../../db/models');
const { createError } = require('../../utils/createError');

/**
 * Проверяет JWT и серверную сессию обновления.
 *
 * @param {import('express').Request} req - Запрос Express
 * @param {import('express').Response} res - Ответ Express
 * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
 * @returns {Promise<void>} Завершает операцию.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw createError(
        'Токен не предоставлен или имеет неверный формат',
        401,
        'INVALID_TOKEN'
      );
    }

    const token = authHeader.slice(7);

    // Проверяет подпись и срок действия маркера доступа.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Проверяет обязательные поля маркера.
    if (
      !Number.isSafeInteger(decoded.id) ||
      decoded.id <= 0 ||
      typeof decoded.sid !== 'string' ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(decoded.sid)
    ) {
      throw createError('Некорректные данные токена', 401, 'INVALID_TOKEN');
    }

    // Проверяет принадлежность и срок серверной сессии.
    const session = await RefreshSession.findOne({
      where: {
        id: decoded.sid,
        userId: decoded.id,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      attributes: ['id'],
    });

    if (!session) {
      throw createError('Сессия завершена или истекла', 401, 'SESSION_REVOKED');
    }

    // Сохраняет контракт req.user с идентификатором пользователя.
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        createError('Срок действия токена истёк', 401, 'TOKEN_EXPIRED')
      );
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return next(createError('Недействительный токен', 401, 'INVALID_TOKEN'));
    }

    next(error);
  }
};

module.exports = { authMiddleware };
