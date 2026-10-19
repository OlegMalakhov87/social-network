const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { sequelize, User } = require('../../db/models');
const refreshSessionService = require('./refreshSessionService');
const { createError } = require('../utils/createError');

/**
 * Генерация JWT токена
 * @param {number} userId - ID пользователя
 * @returns {string} - JWT токен
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Создание хеша пароля
 * @param {string} password - Пароль
 * @returns {Promise<string>} - Хеш пароля
 */
const createPasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Сервис для работы с авторизацией
 */
const authService = {
  /**
   * Получение информации о пользователе
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} - Объект с пользователем
   */
  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'isSystem'] },
    });

    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    return { user: user.toJSON() };
  },

  /**
   * Регистрация пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} - Объект с пользователем и токеном
   */
  async register(userData) {
    const { name, email, password, gender } = userData;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw createError('Email уже используется', 409, 'USER_EXISTS');
    }

    const passwordHash = await createPasswordHash(password);

    let user;
    let refreshSession;

    try {
      await sequelize.transaction(async (transaction) => {
        user = await User.create(
          {
            name,
            email,
            passwordHash,
            gender,
          },
          { transaction }
        );

        refreshSession = await refreshSessionService.create(user.id, {
          transaction,
        });
      });
    } catch (error) {
      if (
        error instanceof UniqueConstraintError &&
        error.errors?.some((item) => item.path === 'email')
      ) {
        throw createError('Email уже используется', 409, 'USER_EXISTS');
      }

      throw error;
    }

    const token = generateToken(user.id);

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;
    delete userResponse.isSystem;

    return {
      user: userResponse,
      token,
      refreshToken: refreshSession.refreshToken,
      expiresAt: refreshSession.expiresAt,
    };
  },

  /**
   * Вход в систему
   * @param {Object} credentials - Данные пользователя
   * @returns {Promise<Object>} - Объект с пользователем и токеном
   */
  async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError(
        'Неверный email или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (user.isSystem) {
      throw createError('Доступ запрещен', 403, 'ACCESS_FORBIDDEN');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw createError(
        'Неверный email или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const refreshSession = await refreshSessionService.create(user.id);
    const token = generateToken(user.id);

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;
    delete userResponse.isSystem;

    return {
      user: userResponse,
      token,
      refreshToken: refreshSession.refreshToken,
      expiresAt: refreshSession.expiresAt,
    };
  },

  /**
   * Обновление пользовательской авторизации.
   *
   * @param {string} refreshToken
   * @returns {Promise<{
   *   token: string,
   *   refreshToken: string,
   *   expiresAt: Date
   * }>}
   */
  async refresh(refreshToken) {
    const session = await refreshSessionService.rotate(refreshToken);

    const user = await User.findByPk(session.userId, {
      attributes: ['id', 'isSystem'],
    });

    if (!user || user.isSystem) {
      await refreshSessionService.revoke(session.refreshToken);

      throw createError(
        'Недействительная сессия',
        401,
        'INVALID_REFRESH_TOKEN'
      );
    }

    const token = generateToken(user.id);

    return {
      token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  },

  /**
   * Завершение текущей пользовательской сессии.
   *
   * @param {string} refreshToken
   * @returns {Promise<{message: string}>}
   */
  async logout(refreshToken) {
    await refreshSessionService.revoke(refreshToken);

    return {
      message: 'Выход выполнен успешно',
    };
  },
};

module.exports = { authService, createPasswordHash };
