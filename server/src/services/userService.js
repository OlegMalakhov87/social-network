const bcrypt = require('bcryptjs');
const WebSocket = require('ws');
const { Op } = require('sequelize');

const { sequelize, User, Friend } = require('../../db/models');
const { clients } = require('../websocket');
const temporaryMediaService = require('./temporaryMediaService');
const { createError } = require('../utils/createError');

/**
 * Перечисляет поля профиля, которые можно обновлять.
 */
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
   * Возвращает профиль и статус дружбы между двумя пользователями.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {number} params.targetUserId - Идентификатор выбранного пользователя
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getUserProfileWithFriendshipStatus({ currentUserId, targetUserId }) {
    const where = { isSystem: false };

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
      attributes: { exclude: ['passwordHash', 'isSystem'] },
    });

    if (!user) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const canSeeFullProfile = isOwner || isFriend || user.isPublic !== false;

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
   * Проверяет онлайн-статус пользователей.
   *
   * Пользователь считается online, если существует хотя бы одно активное соединение WebSocket.
   *
   * @param {Array} userIds - Идентификаторы пользователей
   * @returns {Promise<Object>} Результат операции.
   */
  async checkOnlineBulk(userIds) {
    if (!Array.isArray(userIds)) {
      throw createError('Ожидался массив userIds', 400, 'INVALID_PAYLOAD');
    }

    const normalizedIds = [
      ...new Set(
        userIds.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0)
      ),
    ];

    const now = Date.now();

    return {
      users: normalizedIds.map((id) => {
        const sockets = clients.get(id);

        const online = Boolean(
          sockets &&
          [...sockets].some(
            (ws) => ws.readyState === WebSocket.OPEN && ws.accessExpiresAt > now
          )
        );

        return {
          userId: id,
          online,
        };
      }),
    };
  },

  /**
   * Обновляет профиль текущего пользователя.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} updateData - Данные обновления
   * @returns {Promise<Object>} Объект с результатом.
   */
  async updateUser(currentUserId, updateData) {
    const dbUpdates = Object.fromEntries(
      USER_PROFILE_FIELDS.filter((field) =>
        Object.hasOwn(updateData, field)
      ).map((field) => [field, updateData[field]])
    );

    if (Object.keys(dbUpdates).length === 0) {
      throw createError(
        'Нет данных для обновления',
        400,
        'NO_FIELDS_TO_UPDATE'
      );
    }

    try {
      return await sequelize.transaction(async (transaction) => {
        const user = await User.findByPk(currentUserId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!user) {
          throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
        }

        const newAvatarUrl = dbUpdates.avatarUrl;

        if (newAvatarUrl && newAvatarUrl !== user.avatarUrl) {
          await temporaryMediaService.commitMany(
            currentUserId,
            [
              {
                url: newAvatarUrl,
                fieldName: 'avatarUrl',
              },
            ],
            { transaction }
          );
        }

        const updatedUser = await user.update(dbUpdates, {
          validate: true,
          transaction,
        });

        const userData = updatedUser.toJSON();

        delete userData.passwordHash;
        delete userData.isSystem;

        return { user: userData };
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
  },

  /**
   * Обновляет приватность пользователя.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} params - Параметры вызова
   * @param {boolean} params.isPublic - Признак публичности
   * @returns {Promise<Object>} Объект с результатом.
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
   * Меняет пароль пользователя.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<Object>} Объект с результатом.
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
   * Удаляет пользователя.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @returns {Promise<Object>} Объект с результатом.
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

    await user.destroy();

    return { message: 'Пользователь успешно удален', userId: currentUserId };
  },
};

module.exports = userService;
