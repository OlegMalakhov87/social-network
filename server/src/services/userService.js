const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const { Op } = require('sequelize');
const { User, Friend } = require('../../db/models');
const { clients } = require('../websocket');
const temporaryMediaService = require('./temporaryMediaService');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

/** Поля профиля пользователя, которые можно обновлять. */
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
    // Проверяем, является ли текущий пользователь владельцем профиля
    const isOwner = currentUserId === targetUserId;

    let friendship = null;
    // Если текущий пользователь не является владельцем профиля, то получаем статус дружбы
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

    // Проверяем, является ли текущий пользователь другом
    const isFriend = friendship?.status === 'accepted';

    // Получаем пользователя
    const user = await User.findByPk(targetUserId, {
      attributes: { exclude: ['passwordHash'] },
    });

    // Проверяем, найден ли пользователь
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

    // Обогащаем пользователя данными о дружбе
    const enrichedUser = {
      ...userData,
      friendshipId: friendship?.id,
      friendshipStatus: friendship?.status,
      friendshipDirection: friendship
        ? friendship.userId === currentUserId
          ? 'outgoing'
          : 'incoming'
        : undefined,
      canSeeFullProfile,
    };

    return { user: enrichedUser };
  },

  /**
   * Проверка онлайн статуса пользователей
   * @param {Array<number>} userIds - Массив ID пользователей
   * @returns {Promise<Object>} - Объект с результатом
   */
  async checkOnlineBulk(userIds) {
    // Проверяем, является ли userIds массивом
    if (!Array.isArray(userIds)) {
      throw createError('Ожидался массив userIds', 400, 'INVALID_PAYLOAD');
    }

    // Нормализуем userIds
    const normalizedIds = [
      ...new Set(
        userIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];

    // Возвращаем пользователей с информацией о онлайн статусе
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
    // Получаем пользователя
    const user = await User.findByPk(currentUserId, {
      attributes: {
        exclude: ['passwordHash'],
      },
    });

    // Проверяем, найден ли пользователь
    if (!user) {
      throw createError(
        'Пользователь не найден или нет прав на обновление',
        404,
        'USER_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Обновляем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      USER_PROFILE_FIELDS.filter((field) =>
        Object.hasOwn(updateData, field)
      ).map((field) => [field, updateData[field]])
    );

    // Проверяем, есть ли данные для обновления
    if (Object.keys(dbUpdates).length === 0) {
      throw createError(
        'Нет данных для обновления',
        400,
        'NO_FIELDS_TO_UPDATE'
      );
    }

    // Получаем старый и новый аватар
    const oldAvatarUrl = user.avatarUrl;
    const newAvatarUrl = dbUpdates.avatarUrl;

    let updatedUser;

    // Если есть новый аватар и он отличается от старого, то проверяем владение новым аватаром
    if (newAvatarUrl && newAvatarUrl !== oldAvatarUrl) {
      await temporaryMediaService.assertOwnershipMany(currentUserId, [
        {
          url: newAvatarUrl,
          fieldName: 'avatarUrl',
        },
      ]);
    }

    // Обновляем пользователя
    try {
      updatedUser = await user.update(dbUpdates);
    } catch (error) {
      // Если обновление пользователя не удалось, то удаляем новый аватар
      try {
        if (newAvatarUrl && newAvatarUrl !== oldAvatarUrl) {
          await temporaryMediaService.removeMany(currentUserId, [
            currentUserId,
            {
              url: newAvatarUrl,
              fieldName: 'avatarUrl',
            },
          ]);
        }
      } catch (cleanupError) {
        // Если удаление новых медиа файлов не удалось, то логируем ошибку
        if (cleanupError.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить новый аватар ${newAvatarUrl}:`,
            cleanupError.message
          );
        }
      }

      // Если обновление пользователя не удалось, из-за уникальности email или nickname, то выбрасываем ошибку
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError(
          'Email или nickname уже используется',
          409,
          'USER_FIELD_ALREADY_EXISTS'
        );
      }

      // Если обновление пользователя не удалось, из-за других ошибок, то выбрасываем ошибку
      throw createError(
        'Не удалось обновить пользователя',
        500,
        'UPDATE_FAILED'
      );
    }

    // Если есть новый аватар и он отличается от старого, то фиксируем новый аватар
    if (newAvatarUrl && newAvatarUrl !== oldAvatarUrl) {
      try {
        await temporaryMediaService.commitMany(currentUserId, [
          {
            url: newAvatarUrl,
            fieldName: 'avatarUrl',
          },
        ]);
      } catch (error) {
        console.warn(
          `Не удалось зафиксировать новый аватар ${newAvatarUrl}:`,
          error.message
        );
      }
    }

    // Получаем данные пользователя
    const userData = updatedUser.toJSON();
    delete userData.passwordHash;

    return { user: userData };
  },

  /**
   * Обновление приватности пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {boolean} isPublic - Приватность пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updatePrivacy(currentUserId, { isPublic }) {
    // Обновляем приватность пользователя
    const [affectedCount, updatedUser] = await User.update(
      { isPublic },
      {
        where: { id: currentUserId },
        returning: true,
        plain: true,
      }
    );

    // Если обновление приватности пользователя не удалось, выбрасываем ошибку
    if (affectedCount === 0) {
      throw createError(
        'Не удалось обновить приватность',
        500,
        'UPDATE_FAILED'
      );
    }

    // Возвращаем результат
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
    // Проверяем, есть ли текущий и новый пароль
    if (!currentPassword || !newPassword) {
      throw createError(
        'Текущий и новый пароль обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    // Получаем пользователя
    const user = await User.findByPk(currentUserId);

    // Проверяем, найден ли пользователь
    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    // Проверяем, совпадает ли текущий пароль с паролем пользователя
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw createError(
        'Неверный текущий пароль',
        401,
        'INVALID_CURRENT_PASSWORD'
      );
    }

    // Генерируем соль для нового пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль пользователя
    await user.update({ passwordHash });

    // Возвращаем результат
    return { message: 'Пароль успешно обновлен' };
  },

  /**
   * Удаление пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUser(currentUserId) {
    // Получаем пользователя
    const user = await User.findByPk(currentUserId);

    // Проверяем, найден ли пользователь
    if (!user) {
      throw createError(
        'Пользователь не найден или нет прав на удаление',
        404,
        'USER_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Удаляем пользователя
    await user.destroy();

    // Возвращаем результат
    return { message: 'Пользователь успешно удален', userId: currentUserId };
  },
};

module.exports = userService;
