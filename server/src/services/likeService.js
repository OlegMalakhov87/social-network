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
const { createError } = require('./authService');

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

/**
 * Маппинг типов сущностей на типы в БД
 */
const GROUPED_TYPES = {
  Post: 'posts',
  Music: 'tracks',
  Video: 'videos',
  News: 'news',
  Comment: 'comments',
  Message: 'messages',
};

const likeService = {
  /**
   * Получить все лайки сущности (для админки, может быть когда нибудь пригодится)
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async getLikesByTarget(targetType, targetId) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const { count, rows } = await Like.findAndCountAll({
      where: { targetType: target.dbType, targetId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      targetType,
      targetId,
      count,
      likes: rows.map((l) => l.toJSON()),
    };
  },

  /**
   * Получить все лайки пользователя (для админки, может быть когда нибудь пригодится)
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество лайков на странице
   * @returns {Promise<Object>}
   */
  async getUserLikes(userId, page = 1, limit = 30) {
    const { count, rows: likes } = await Like.findAndCountAll({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    const groupedLikes = {
      posts: [],
      tracks: [],
      videos: [],
      news: [],
      comments: [],
      messages: [],
    };

    for (const like of likes) {
      const type = GROUPED_TYPES[like.targetType];

      if (type) {
        groupedLikes[type].push(like.toJSON());
      }
    }

    return {
      userId,
      totalLikes: count,
      groupedLikes,
      pagination: {
        totalLikes: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Проверить, поставлен ли лайк сущности (для админки, может быть когда нибудь пригодится)
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async checkLike(userId, targetType, targetId) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const like = await Like.findOne({
      where: {
        userId,
        targetType: target.dbType,
        targetId: targetId,
      },
    });

    return { hasLiked: !!like };
  },

  /**
   * Поставить лайк сущности
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async addLike(userId, targetType, targetId) {
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
        userId,
        targetType: target.dbType,
        targetId,
      });

      const likeWithUser = await Like.findByPk(like.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
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
   * Удалить лайк у сущности
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async deleteLike(userId, targetType, targetId) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const deletedCount = await Like.destroy({
      where: {
        userId,
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
