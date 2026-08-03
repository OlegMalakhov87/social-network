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

// Словарь моделей для проверки существования целевой сущности
const TARGET_MODELS = {
  Post,
  Music,
  Video,
  News,
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
   * @returns {Promise<Object>} { comments, pagination }
   */
  async getCommentsByTarget(targetType, targetId, page = 1, limit = 30, sortKey = 'dateDesc') {
    const validTypes = Object.keys(TARGET_MODELS);
    if (!validTypes.includes(targetType)) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        targetType,
        targetId: parseInt(targetId),
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
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return {
      // Обогащаем комментарии данными о количестве лайков
      comments: comments.map((comment) => ({
        ...comment.toJSON(),
        likesCount: comment.likes.length,
      })),
      pagination: {
        totalComments: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
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
   * Получение комментариев пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество комментариев на странице
   * @returns {Promise<Object>} { userId, comments, pagination }
   */
  async getUserComments(userId, page = 1, limit = 50) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { userId: parseInt(userId) },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return {
      userId: parseInt(userId),
      comments: comments.map((c) => c.toJSON()),
      pagination: {
        totalComments: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
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

    if (!Object.keys(TARGET_MODELS).includes(targetType)) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    // Динамическая проверка существования сущности
    const TargetModel = TARGET_MODELS[targetType];
    const targetExists = await TargetModel.findByPk(targetId, {
      attributes: ['id'],
    });

    if (!targetExists) {
      throw createError('Целевая сущность не найдена', 404, 'TARGET_NOT_FOUND');
    }

    const comment = await Comment.create({
      userId: currentUserId,
      targetType,
      targetId: parseInt(targetId),
      text: text.trim(),
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

    // Проверка прав внутри сервиса
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
      { text: updateData.text.trim() },
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

    // Проверка прав внутри сервиса
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
