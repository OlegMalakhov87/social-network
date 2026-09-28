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
 * Маппинг типов сущностей на модели и типы в БД
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
   * Поставить лайк сущности
   * @param {Object} params - Параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {string} params.targetType - Тип сущности
   * @param {number} params.targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async addLike({ currentUserId, targetType, targetId }) {
    // Динамическая проверка существования сущности
    const target = TARGET_TYPES[targetType];
    // Если сущность не найдена, выбрасываем ошибку
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    // Получаем сущность
    const targetEntity = await target.model.findByPk(targetId, {
      attributes: ['id'],
    });

    // Если сущность не найдена, выбрасываем ошибку
    if (!targetEntity) {
      throw createError('Сущность не найдена', 404, 'ENTITY_NOT_FOUND');
    }

    // Создаем лайк
    try {
      const like = await Like.create({
        userId: currentUserId,
        targetType: target.dbType,
        targetId,
      });

      // Получаем лайк с автором
      const likeWithUser = await Like.findByPk(like.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        ],
      });

      // Получаем количество лайков
      const likesCount = await Like.count({
        where: {
          targetType: target.dbType,
          targetId,
        },
      });

      // Возвращаем лайк с автором и количеством лайков
      return { like: likeWithUser.toJSON(), likesCount };
      // Если ошибка, выбрасываем ошибку
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError('Лайк уже поставлен', 400, 'ALREADY_LIKED');
      }
      throw error;
    }
  },

  /**
   * Удалить лайк у сущности
   * @param {Object} params - Параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {string} params.targetType - Тип сущности
   * @param {number} params.targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async deleteLike({ currentUserId, targetType, targetId }) {
    // Динамическая проверка существования сущности
    const target = TARGET_TYPES[targetType];
    // Если сущность не найдена, выбрасываем ошибку
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    // Удаляем лайк
    const deletedCount = await Like.destroy({
      where: {
        userId: currentUserId,
        targetType: target.dbType,
        targetId,
      },
    });

    // Если лайк не найден или уже удален, выбрасываем ошибку
    if (deletedCount === 0) {
      throw createError('Лайк не найден или уже удален', 404, 'LIKE_NOT_FOUND');
    }

    // Получаем количество лайков
    const likesCount = await Like.count({
      where: {
        targetType: target.dbType,
        targetId,
      },
    });

    // Возвращаем сообщение о успешном удалении лайка и количестве лайков
    return { message: 'Лайк успешно удален', targetType, targetId, likesCount };
  },
};

module.exports = likeService;
