const {
  Comment,
  User,
  Like,
  Post,
  Music,
  Video,
  News,
} = require('../../db/models');
const { Op } = require('sequelize');
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
};

/**
 * Маппинг типов сущностей на типы в БД
 */
const GROUPED_TYPES = {
  Post: 'posts',
  Music: 'tracks',
  Video: 'videos',
  News: 'news',
};

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['likesCount', 'DESC']],
  viewsAsc: [['likesCount', 'ASC']],
};

const commentService = {
  /**
   * Получение комментариев для конкретной сущности
   * @param {string} targetType - Тип сущности
   * @param {number} targetId - ID сущности
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество комментариев на странице
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} { comments, pagination }
   */
  async getCommentsByTarget(
    targetType,
    targetId,
    page = 1,
    limit = 30,
    currentUserId,
    sortKey = 'dateDesc'
  ) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        targetType: target.dbType,
        targetId,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
      ],
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      // Обогащаем комментарии данными о количестве лайков
      comments: comments.map((comment) => ({
        ...comment.toJSON(),
        likesCount: comment.likes?.length ?? 0,
        isLiked:
          comment.likes?.some((like) => like.userId === currentUserId) ?? false,
      })),
      pagination: {
        totalComments: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получение комментариев пользователя (для админки)
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество комментариев на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>} { userId, comments, pagination }
   */
  async getUserComments(userId, page = 1, limit = 30, sortKey = 'dateDesc') {
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      userId,
      comments: comments.map((comment) => comment.toJSON()),
      pagination: {
        totalComments: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получение комментария по ID для shared комментария
   * @param {number} commentId - ID комментария
   * @returns {Promise<Object>} { comment }
   */
  async getCommentById(commentId) {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }

    return { comment: comment.toJSON() };
  },

  /**
   * Создание комментария
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} commentData - Данные комментария
   * @returns {Promise<Object>} { comment }
   */
  async createComment(currentUserId, commentData) {
    const { targetType, targetId, text } = commentData;

    if (!targetType || !targetId || !text) {
      throw createError(
        'Поля targetType, targetId и text обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    // Динамическая проверка существования сущности
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

    const comment = await Comment.create({
      userId: currentUserId,
      targetType: target.dbType,
      targetId,
      text: text.trim(),
      isEdited: false,
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return { comment: commentWithAuthor.toJSON() };
  },

  /**
   * Обновление комментария
   * @param {number} commentId - ID комментария
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} { comment }
   */
  async updateComment(commentId, currentUserId, updateData) {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }

    // Проверка прав
    if (comment.userId !== currentUserId) {
      throw createError(
        'Вы не можете редактировать этот комментарий',
        403,
        'FORBIDDEN'
      );
    }

    if (!updateData.text || updateData.text.trim().length === 0) {
      throw createError(
        'Комментарий не может быть пустым',
        400,
        'EMPTY_COMMENT'
      );
    }

    // Обновляем и возвращаем результат одним запросом
    const [, updatedRows] = await Comment.update(
      { text: updateData.text.trim(), isEdited: true },
      {
        where: { id: commentId },
        returning: true,
        plain: true,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
      }
    );

    return { comment: updatedRows.toJSON() };
  },

  /**
   * Удаление комментария
   * @param {number} commentId - ID комментария
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} { message, commentId }
   */
  async deleteComment(commentId, currentUserId) {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }

    // Проверка прав
    if (comment.userId !== currentUserId) {
      throw createError(
        'Вы не можете удалить этот комментарий',
        403,
        'FORBIDDEN'
      );
    }

    await comment.destroy();
    return { message: 'Комментарий успешно удален', commentId };
  },
};

module.exports = commentService;
