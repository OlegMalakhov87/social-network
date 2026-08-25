const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const { User } = require('../../db/models');
const { clients } = require('../websocket');
const createError = require('../utils/createError');

const userService = {
  /**
   * Проверка онлайн статуса пользователей
   * @param {Array<number>} userIds - Массив ID пользователей
   * @returns {Promise<Object>} { users }
   */
  async checkOnlineBulk(userIds) {
    if (!Array.isArray(userIds)) {
      throw createError('Ожидался массив userIds', 400, 'INVALID_PAYLOAD');
    }

    return {
      users: userIds.map((id) => ({
        userId: id,
        online: clients.has(String(id)),
      })),
    };
  },

  /**
   * Обновление пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} updates - Данные для обновления
   * @returns {Promise<Object>} { user }
   */
  async updateUser(userId, updates) {
    const { passwordHash, ...safeUpdates } = updates;

    if (Object.keys(safeUpdates).length === 0) {
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');
    }

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
   * Обновление приватности пользователя
   * @param {number} userId - ID пользователя
   * @param {boolean} isPublic - Приватность пользователя
   * @returns {Promise<Object>} { isPublic }
   */
  async updatePrivacy(userId, isPublic) {
    const [affectedCount, updatedUser] = await User.update(
      { isPublic },
      {
        where: { id: userId },
        returning: true,
        plain: true,
      }
    );

    if (affectedCount === 0) {
      throw createError(
        'Не удалось обновить приватность',
        500,
        'UPDATE_FAILED'
      );
    }

    return {
      message: 'Приватность пользователя успешно обновлена',
      isPublic: updatedUser.isPublic,
    };
  },

  /**
   * Загрузка аватара пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} file - Файл аватара
   * @returns {Promise<Object>} { avatarUrl }
   */
  async uploadAvatar(userId, file) {
    if (!file) {
      throw createError('Файл не предоставлен', 400, 'NO_FILE_PROVIDED');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const isDefaultAvatar =
      !user.avatarUrl || user.avatarUrl.includes('default-user.png');

    if (!isDefaultAvatar) {
      const oldFilePath = path.join(__dirname, '../../', user.avatarUrl);

      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn(
          `Не удалось удалить старый аватар ${oldFilePath}:`,
          err.message
        );
      }
    }

    const newAvatarPath = `/${file.path}`;

    const [affectedCount, updatedUser] = await User.update(
      { avatarUrl: newAvatarPath },
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

    return { avatarUrl: newAvatarPath };
  },

  /**
   * Изменение пароля пользователя
   * @param {number} userId - ID пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<Object>} { message }
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
   * @returns {Promise<Object>} { message, userId }
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError(
        'Пользователь не найден или нет прав на удаление',
        404,
        'USER_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Логика очистки аватара пользователя
    if (user.avatarUrl !== undefined) {
      const oldFilePath = path.join(__dirname, '../../', user.avatarUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старый аватар:', err.message);
      }
    }
    await user.destroy();
    return { message: 'Пользователь успешно удален', userId };
  },
};

module.exports = userService;
