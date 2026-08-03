const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../db/models');

/**
 * Фабрика ошибок. Создает объект Error с дополнительными полями
 * для корректной обработки в errorMiddleware.
 *
 * @param {string} message - Человекочитаемое сообщение
 * @param {number} statusCode - HTTP статус (400, 401, 404, 409...)
 * @param {string} [code] - Машинный код ошибки (для фронтенда)
 */
const createError = (message, statusCode = 500, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

/**
 * Генерация JWT токена
 * @param {number} userId - ID пользователя
 * @returns {string} - JWT токен
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Сервис для работы с авторизацией
 */
const authService = {
  /**
   * Регистрация пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} - Объект с пользователем и токеном
   */
  async register(userData) {
    const { name, email, password, nickname, age } = userData;

    // Проверяем, нет ли уже такого email в базе данных
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw createError('Email уже используется', 409, 'USER_EXISTS');
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Создаем пользователя
    const user = await User.create({
      name,
      email,
      passwordHash,
      nickname: nickname || null,
      age: age || null,
    });

    // Генерируем токен
    const token = generateToken(user.id);

    // Возвращаем безопасный объект (без passwordHash)
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
  },

  /**
   * Вход в систему
   * @param {Object} credentials - Данные пользователя
   * @returns {Promise<Object>} - Объект с пользователем и токеном
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Проверяем, есть ли пользователь с таким email в базе данных
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw createError(
        'Неверный email или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Проверяем, совпадает ли пароль
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw createError(
        'Неверный email или пароль',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Генерируем токен
    const token = generateToken(user.id);

    // Возвращаем безопасный объект (без passwordHash)
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
  },

  /**
   * Получение информации о пользователе
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} - Объект с пользователем
   */
  async getMe(userId) {
    // Запрос к БД делается только здесь, когда реально нужен профиль
    // Это предотвращает лишние запросы при аутентификации
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    return { user: user.toJSON() };
  },
};

module.exports = { authService };
