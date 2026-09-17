const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const { Op } = require('sequelize');
const { User, Friend } = require('../../db/models');
const { clients } = require('../websocket');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');
const { toPublicUrl } = require('../utils/toPublicUrl');

const USER_PROFILE_FIELDS = [
  'name',
  'avatarUrl',
  'nickname',
  'birthDate',
  'email',
  'address',
  'job',
  'status',
  'phone',
];

const userService = {
  /**
   * Получить пользователя с информацией о статусе дружбы между двумя пользователями
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.targetUserId - ID пользователя, с которым проверяем статус дружбы
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getUserProfileWithFriendshipStatus({ currentUserId, targetUserId }) {
    const isOwner = currentUserId === targetUserId;

    let friendship = null;
    if (!isOwner) {
      friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
        },
      });
    }

    const isFriend = friendship?.status === 'accepted';

    const user = await User.findByPk(targetUserId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    // Проверяем, может ли текущий пользователь увидеть полный профиль
    const canSeeFullProfile = isOwner || isFriend || user.isPublic !== false;

    // Скрываем часть полей профиля если не может увидеть полный профиль
    const userData = user.toJSON();
    if (!canSeeFullProfile) {
      delete userData.email;
      delete userData.phone;
      delete userData.address;
      delete userData.job;
      delete userData.status;
      delete userData.birthDate;
      delete userData.isPublic;
      delete userData.gender;
      delete userData.createdAt;
      delete userData.updatedAt;
    }

    return {
      user: {
        ...userData,
        friendshipStatus: friendship?.status ?? null,
        friendshipDirection: friendship
          ? friendship.userId === currentUserId
            ? 'outgoing'
            : 'incoming'
          : null,
        friendshipId: friendship?.id ?? null,
        canSeeFullProfile,
        isBlocked:
          friendship?.status === 'blocked' &&
          friendshipDirection === 'outgoing',
      },
    };
  },

  /**
   * Проверка онлайн статуса пользователей
   * @param {Array<number>} userIds - Массив ID пользователей
   * @returns {Promise<Object>} - Объект с результатом
   */
  async checkOnlineBulk(userIds) {
    if (!Array.isArray(userIds)) {
      throw createError('Ожидался массив userIds', 400, 'INVALID_PAYLOAD');
    }

    const normalizedIds = [
      ...new Set(
        userIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];

    return {
      users: normalizedIds.map((id) => ({
        userId: id,
        online: clients.has(String(id)),
      })),
    };
  },

  /**
   * Обновление профиля текущего пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateUser(currentUserId, updateData) {
    const dbUpdates = Object.fromEntries(
      USER_PROFILE_FIELDS.filter((field) =>
        Object.hasOwn(updateData, field)
      ).map((field) => [field, updateData[field]])
    );

    if (Object.keys(dbUpdates).length === 0) {
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');
    }

    let affectedCount = 0;
    let updatedUser = null;

    try {
      [affectedCount, updatedUser] = await User.update(dbUpdates, {
        where: { id: currentUserId },
        returning: true,
        plain: true,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError(
          'Email или nickname уже используется',
          409,
          'USER_FIELD_ALREADY_EXISTS'
        );
      }

      throw error;
    }

    if (affectedCount === 0) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const userData = updatedUser.toJSON();
    delete userData.passwordHash;
    return { user: userData };
  },

  /**
   * Загрузка аватара пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} file - Файл аватара
   * @returns {Promise<Object>} - Объект с результатом
   */
  async uploadAvatar(currentUserId, file) {
    if (!file) {
      throw createError('Файл не предоставлен', 400, 'NO_FILE_PROVIDED');
    }

    const user = await User.findByPk(currentUserId);
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const oldAvatarUrl = user.avatarUrl;
    const newAvatarPath = file.path;
    const newAvatarUrl = toPublicUrl(newAvatarPath);

    const [affectedCount] = await User.update(
      { avatarUrl: newAvatarUrl },
      {
        where: { id: currentUserId },
      }
    );

    // Если обновление в БД не удалось, удаляем новый аватар
    if (affectedCount === 0) {
      try {
        await fs.unlink(newAvatarPath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить новый аватар ${newAvatarPath}:`,
            error.message
          );
        }
      }

      throw createError('Не удалось обновить аватар', 500, 'UPDATE_FAILED');
    }

    // Если старый аватар существует, удаляем его
    if (oldAvatarUrl) {
      const filePath = fromPublicUrl(oldAvatarUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старый аватар ${oldAvatarUrl}:`,
            error.message
          );
        }
      }
    }
    return { avatarUrl: newAvatarUrl };
  },

  /**
   * Обновление приватности пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {boolean} isPublic - Приватность пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updatePrivacy(currentUserId, { isPublic }) {
    const [affectedCount, updatedUser] = await User.update(
      { isPublic },
      {
        where: { id: currentUserId },
        returning: true,
        plain: true,
      }
    );

    // Если обновление в БД не удалось, выбрасываем ошибку
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
   * Изменение пароля пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<Object>} - Объект с результатом
   */
  async changePassword(currentUserId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw createError(
        'Текущий и новый пароль обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    const user = await User.findByPk(currentUserId);
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
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUser(currentUserId) {
    const user = await User.findByPk(currentUserId);

    if (!user) {
      throw createError(
        'Пользователь не найден или нет прав на удаление',
        404,
        'USER_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    const avatarUrl = user.avatarUrl;

    await user.destroy();

    // Логика очистки аватара пользователя
    if (avatarUrl) {
      const filePath = fromPublicUrl(avatarUrl);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`Не удалось удалить аватар ${filePath}:`, error.message);
        }
      }
    }
    return { message: 'Пользователь успешно удален', userId: currentUserId };
  },

   /**
   * Удаление загруженного аватара пользователя
   * @param {string} avatarUrl - URL аватара файла
   * @returns {Promise<Object>} - Объект с результатом
   */
   async deleteUploadedAvatar({ avatarUrl }) {
    if (!avatarUrl) return;

    const filePath = fromPublicUrl(avatarUrl);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    return { message: 'Загруженный аватар успешно удален' };
  },
};

module.exports = userService;
