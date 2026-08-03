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

// Словарь моделей для динамической проверки существования целевой сущности
const TARGET_MODELS = {
  Post,
  Music,
  Video,
  News,
  Comment,
  Message,
};

const likeService = {
  /**
   * Поставить лайк сущности
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async addLike(userId, targetType, targetId) {
    if (!TARGET_MODELS[targetType]) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const TargetModel = TARGET_MODELS[targetType];
    const targetExists = await TargetModel.findByPk(targetId, {
      attributes: ['id'],
    });

    if (!targetExists) {
      throw createError('Целевая сущность не найдена', 404, 'TARGET_NOT_FOUND');
    }

    try {
      const like = await Like.create({
        userId: parseInt(userId),
        targetType,
        targetId: parseInt(targetId),
      });

      const likeWithUser = await Like.findByPk(like.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
        ],
      });

      return { like: likeWithUser.toJSON() };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError('Лайк уже поставлен', 400, 'ALREADY_LIKED');
      }
      throw error;
    }
  },

  /**
   * Убрать лайк с сущности
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async removeLike(userId, targetType, targetId) {
    if (!TARGET_MODELS[targetType]) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const deletedCount = await Like.destroy({
      where: {
        userId: parseInt(userId),
        targetType,
        targetId: parseInt(targetId),
      },
    });

    if (deletedCount === 0) {
      throw createError('Лайк не найден или уже удален', 404, 'LIKE_NOT_FOUND');
    }

    return { message: 'Лайк успешно убран', targetType, targetId };
  },

  /**
   * Проверить, поставлен ли лайк сущности
   * @param {number} userId - ID пользователя
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async checkLike(userId, targetType, targetId) {
    if (!TARGET_MODELS[targetType]) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const like = await Like.findOne({
      where: {
        userId: parseInt(userId),
        targetType,
        targetId: parseInt(targetId),
      },
    });

    return { hasLiked: !!like };
  },

  /**
   * Получить все лайки сущности
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @returns {Promise<Object>}
   */
  async getLikesByTarget(targetType, targetId) {
    if (!TARGET_MODELS[targetType]) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const likes = await Like.findAll({
      where: { targetType, targetId: parseInt(targetId) },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      targetType,
      targetId,
      count: likes.length,
      likes: likes.map((l) => l.toJSON()),
    };
  },

  /**
   * Получить все лайки пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество лайков на странице
   * @returns {Promise<Object>}
   */
  async getUserLikes(userId, page = 1, limit = 50) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: likes } = await Like.findAndCountAll({
      where: { userId: parseInt(userId) },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const grouped = {
      posts: likes
        .filter((l) => l.targetType === 'Post')
        .map((l) => l.toJSON()),
      music: likes
        .filter((l) => l.targetType === 'Music')
        .map((l) => l.toJSON()),
      videos: likes
        .filter((l) => l.targetType === 'Video')
        .map((l) => l.toJSON()),
      news: likes.filter((l) => l.targetType === 'News').map((l) => l.toJSON()),
      comments: likes
        .filter((l) => l.targetType === 'Comment')
        .map((l) => l.toJSON()),
      messages: likes
        .filter((l) => l.targetType === 'Message')
        .map((l) => l.toJSON()),
    };

    return {
      userId: parseInt(userId),
      totalLikes: count,
      likes: likes.map((l) => l.toJSON()),
      grouped,
      pagination: {
        totalLikes: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },
};

module.exports = likeService;
