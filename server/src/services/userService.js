const bcrypt = require('bcryptjs');
const { User, Friend } = require('../../db/models');
const { Op } = require('sequelize');
const { clients } = require('../websocket');
const { createError } = require('./authService');

const userService = {
  /**
   * Поиск пользователей
   * @param {string} query - Поисковый запрос
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество пользователей на странице
   * @returns {Promise<Object>} - Объект с пользователями и пагинацией
   */
  async searchUsers(query, page = 1, limit = 30) {
    if (!query || query.trim().length < 2) {
      throw createError(
        'Поисковый запрос должен содержать минимум 2 символа',
        400,
        'INVALID_SEARCH_QUERY'
      );
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${query.trim()}%`;

    const { count, rows: users } = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: searchTerm } },
          { nickname: { [Op.iLike]: searchTerm } },
          { email: { [Op.iLike]: searchTerm } },
        ],
      },
      attributes: { exclude: ['passwordHash'] },
      limit: parseInt(limit),
      offset,
    });

    return {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    };
  },

  /**
   * Получение всех пользователей
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество пользователей на странице
   * @returns {Promise<Object>} - Объект с пользователями и пагинацией
   */
  async getAllUsers(page = 1, limit = 30) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['passwordHash'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users,
      pagination: {
        totalUsers: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Получение пользователя по ID
   * @param {number} targetUserId - ID целевого пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с пользователем
   */
  async getUserById(targetUserId, currentUserId) {
    const targetUser = await User.findByPk(targetUserId, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!targetUser) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    // Проверка на владение профилем
    const isOwner = currentUserId === targetUserId;
    let isFriend = false;

    // Проверка на дружбу с пользователем которого просматриваем
    if (!isOwner) {
      const friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
          status: 'accepted',
        },
      });
      isFriend = !!friendship;
    }

    // Проверяем, может ли текущий пользователь увидеть полный профиль целевого пользователя
    const canSeeFullProfile =
      isOwner || isFriend || targetUser.isPublic === true;

    // Выбираем атрибуты для возврата
    const attributesToReturn = canSeeFullProfile
      ? { exclude: ['passwordHash'] }
      : ['id', 'name', 'avatar', 'isPublic', 'createdAt'];

    // Получаем пользователя с нужными атрибутами
    const user = await User.findByPk(targetUserId, {
      attributes: attributesToReturn,
    });

    return { user: user.toJSON(), isOwner, isFriend };
  },

  /**
   * Проверка онлайн статуса пользователей
   * @param {Array<number>} userIds - Массив ID пользователей
   * @returns {Promise<Object>} - Объект с пользователями и их онлайн статусом
   */
  async checkOnlineBulk(userIds) {
    if (!Array.isArray(userIds)) {
      throw createError('Ожидался массив userIds', 400, 'INVALID_PAYLOAD');
    }

    return {
      users: userIds.map((id) => ({
        userId: id,
        online: clients.has(String(id)), // WebSocket хранит ID как строки
      })),
    };
  },

  /**
   * Создание пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} - Объект с пользователем
   */
  async createUser(userData) {
    const { name, age, email, password } = userData;

    if (!email || !password) {
      throw createError('Email и пароль обязательны', 400, 'MISSING_FIELDS');
    }

    // Проверяем, не занят ли email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw createError('Email уже используется', 409, 'USER_EXISTS');
    }

    // Генерируем хэш пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Создаем пользователя
    const user = await User.create({
      email,
      passwordHash,
      name: name || null,
      age: age || null,
    });

    // Возвращаем пользователя без пароля
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return { user: userResponse };
  },

  /**
   * Обновление пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} updates - Данные для обновления
   * @returns {Promise<Object>} - Объект с обновленным пользователем
   */
  async updateUser(userId, updates) {
    // Защита: запрещаем обновлять пароль или email через этот метод (для этого есть отдельные методы)
    const { passwordHash, email, ...safeUpdates } = updates;

    if (Object.keys(safeUpdates).length === 0) {
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');
    }

    // Возвращаем обновленную запись сразу
    const [affectedCount, updatedUser] = await User.update(safeUpdates, {
      where: { id: userId },
      returning: true,
      plain: true,
      attributes: { exclude: ['passwordHash'] },
    });

    if (affectedCount === 0) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    return { user: updatedUser.toJSON() };
  },

  /**
   * Загрузка аватара пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} file - Файл аватара
   * @returns {Promise<Object>} - Объект с путем к новому аватару
   */
  async uploadAvatar(userId, file) {
    if (!file) {
      throw createError('Файл не предоставлен', 400, 'NO_FILE_PROVIDED');
    }

    // Получаем текущие данные пользователя, чтобы найти путь к старому аватару
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    // Если старый аватар существует и это не дефолтная картинка, удаляем его с диска
    if (user.avatar && !user.avatar.includes('avatar.png')) {
      const oldFilePath = path.join(__dirname, '../../', user.avatar);

      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        //Не прерываем загрузку нового аватара, если старый не удалился
        console.warn(
          `Не удалось удалить старый аватар ${oldFilePath}:`,
          err.message
        );
      }
    }

    // Обновляем запись в БД.
    const newAvatarPath = `/${file.path}`;

    const [affectedCount, updatedUser] = await User.update(
      { avatar: newAvatarPath },
      {
        where: { id: userId },
        returning: true,
        plain: true,
        attributes: { exclude: ['passwordHash'] },
      }
    );

    if (affectedCount === 0) {
      throw createError('Не удалось обновить аватар', 500, 'UPDATE_FAILED');
    }

    return { avatar: newAvatarPath };
  },

  /**
   * Изменение пароля пользователя
   * @param {number} userId - ID пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<Object>} - Объект с сообщением об успешном изменении пароля
   */
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw createError(
        'Текущий и новый пароль обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw createError(
        'Неверный текущий пароль',
        401,
        'INVALID_CURRENT_PASSWORD'
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await user.update({ passwordHash });

    return { message: 'Пароль успешно обновлен' };
  },

  /**
   * Удаление пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} - Объект с сообщением об успешном удалении пользователя
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    await user.destroy();
    return { message: 'Пользователь успешно удален', userId };
  },
};

module.exports = userService;
