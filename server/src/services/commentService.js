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
  async getCommentsByTarget({
    targetType,
    targetId,
    page = 1,
    limit = 30,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    // Динамическая проверка существования сущности
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }
    // Получаем комментарии для конкретной сущности с автором и лайками
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        targetType: target.dbType,
        targetId,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
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

    // Обогащаем комментарии данными о количестве лайков и статусе лайка текущего пользователя
    return {
      comments: comments.map((comment) => ({
        ...comment.toJSON(),
        likesCount: comment.likes?.length,
        isLiked: comment.likes?.some((like) => like.userId === currentUserId),
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
   * Получение комментария по ID для кнопки "Поделиться"
   * @param {number} commentId - ID комментария
   * @returns {Promise<Object>} { comment }
   */
  async getCommentById(commentId) {
    // Получаем комментарий по ID с автором
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });
    // Если комментарий не найден, выбрасываем ошибку
    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }
    // Возвращаем комментарий с автором
    return comment.toJSON();
  },

  /**
   * Создание комментария
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} commentData - Данные комментария
   * @returns {Promise<Object>} { comment }
   */
  async createComment(currentUserId, commentData) {
    const { targetType, targetId, text } = commentData;

    // Динамическая проверка существования сущности
    const target = TARGET_TYPES[targetType];
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

    // Создаем комментарий
    const comment = await Comment.create({
      userId: currentUserId,
      targetType: target.dbType,
      targetId,
      text: text.trim(),
      isEdited: false,
    });

    // Получаем комментарий с автором
    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    // Возвращаем комментарий с автором
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
    // Обновляем комментарий
    const [affectedCount] = await Comment.update(
      { text: updateData.text.trim(), isEdited: true },
      {
        where: {
          id: commentId,
          userId: currentUserId,
        },
        returning: true,
      }
    );

    // Если комментарий не найден или нет прав на редактирование, выбрасываем ошибку
    if (affectedCount === 0) {
      throw createError(
        'Комментарий не найден или нет прав на редактирование',
        404,
        'COMMENT_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Получаем обновлённый комментарий с автором
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    // Возвращаем обновлённый комментарий с автором
    return { comment: updatedComment.toJSON() };
  },

  /**
   * Удаление комментария
   * @param {number} commentId - ID комментария
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} { message, commentId }
   */
  async deleteComment(commentId, currentUserId) {
    // Получаем комментарий по ID
    const comment = await Comment.findByPk(commentId);
    
    // Если комментарий не найден, выбрасываем ошибку
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
