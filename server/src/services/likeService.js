const {
  Like,
  User,
  Post,
  Music,
  Video,
  News,
  Comment,
  Message,
} = require('../../db/models');
const { createError } = require('../utils/createError');

/**
 * Сопоставляет тип сущности с моделью Sequelize.
 */
const TARGET_TYPES = {
  posts: {
    model: Post,
    dbType: 'Post',
  },

  tracks: {
    model: Music,
    dbType: 'Music',
  },

  videos: {
    model: Video,
    dbType: 'Video',
  },

  news: {
    model: News,
    dbType: 'News',
  },

  comments: {
    model: Comment,
    dbType: 'Comment',
  },

  messages: {
    model: Message,
    dbType: 'Message',
  },
};

const likeService = {
  /**
   * Создает лайк сущности.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {string} params.targetType - Тип сущности
   * @param {number} params.targetId - Идентификатор сущности
   * @returns {Promise<Object>} Результат операции.
   */
  async addLike({ currentUserId, targetType, targetId }) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const targetEntity = await target.model.findByPk(targetId, {
      attributes: ['id'],
    });

    if (!targetEntity) {
      throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
    }

    try {
      const like = await Like.create({
        userId: currentUserId,
        targetType: target.dbType,
        targetId,
      });

      const likeWithUser = await Like.findByPk(like.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        ],
      });

      const likesCount = await Like.count({
        where: {
          targetType: target.dbType,
          targetId,
        },
      });

      return { like: likeWithUser.toJSON(), likesCount };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError('Лайк уже поставлен', 400, 'ALREADY_LIKED');
      }
      throw error;
    }
  },

  /**
   * Удаляет лайк сущности.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {string} params.targetType - Тип сущности
   * @param {number} params.targetId - Идентификатор сущности
   * @returns {Promise<Object>} Объект с результатом.
   */
  async deleteLike({ currentUserId, targetType, targetId }) {
    const target = TARGET_TYPES[targetType];

    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const deletedCount = await Like.destroy({
      where: {
        userId: currentUserId,
        targetType: target.dbType,
        targetId,
      },
    });

    if (deletedCount === 0) {
      throw createError('Лайк не найден или уже удален', 404, 'LIKE_NOT_FOUND');
    }

    const likesCount = await Like.count({
      where: {
        targetType: target.dbType,
        targetId,
      },
    });

    return { message: 'Лайк успешно удален', targetType, targetId, likesCount };
  },
};

module.exports = likeService;
