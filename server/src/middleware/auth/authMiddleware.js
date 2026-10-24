const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { RefreshSession } = require('../../../db/models');
const { createError } = require('../../utils/createError');

/**
 * Middleware для проверки JWT и серверной refresh-сессии.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
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

    // Проверяем подпись и срок действия access JWT.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Проверяем обязательные claims.
    if (
      !Number.isSafeInteger(decoded.id) ||
      decoded.id <= 0 ||
      typeof decoded.sid !== 'string' ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(decoded.sid)
    ) {
      throw createError('Некорректные данные токена', 401, 'INVALID_TOKEN');
    }

    // Проверяем принадлежность и срок серверной сессии.
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

    // Сохраняем существующий контракт req.user.
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
