const {
  Comment,
  User,
  Like,
  Post,
  Music,
  Video,
  News,
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
};

/**
 * Ограничивает сортировку известными полями и закрывает подстановку SQL.
 */
const SORT_MAP = {
  dateDesc: { field: 'createdAt', direction: 'DESC' },
  dateAsc: { field: 'createdAt', direction: 'ASC' },
  viewsDesc: { field: 'likesCount', direction: 'DESC' },
  viewsAsc: { field: 'likesCount', direction: 'ASC' },
};

const commentService = {
  /**
   * Возвращает комментарии сущности.
   *
   * @param {Object} params - Параметры вызова
   * @param {string} params.targetType - Тип сущности
   * @param {number} params.targetId - Идентификатор сущности
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} { comments, pagination }.
   */
  async getCommentsByTarget({
    targetType,
    targetId,
    page = 1,
    limit = 30,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    const target = TARGET_TYPES[targetType];
    if (!target) {
      throw createError('Неверный тип сущности', 400, 'INVALID_TARGET_TYPE');
    }

    const sort = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

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
      order: [
        [sort.field, sort.direction],
        ['id', sort.direction],
      ],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

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
   * Возвращает комментарий по идентификатору для кнопки «Поделиться».
   *
   * @param {number} commentId - Идентификатор комментария
   * @returns {Promise<Object>} { comment }.
   */
  async getCommentById(commentId) {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });
    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }
    return comment.toJSON();
  },

  /**
   * Создает комментарий.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} commentData - Данные комментария
   * @returns {Promise<Object>} { comment }.
   */
  async createComment(currentUserId, commentData) {
    const { targetType, targetId, text } = commentData;

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
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return { comment: commentWithAuthor.toJSON() };
  },

  /**
   * Обновляет комментарий.
   *
   * @param {number} commentId - Идентификатор комментария
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} updateData - Данные обновления
   * @returns {Promise<Object>} { comment }.
   */
  async updateComment(commentId, currentUserId, updateData) {
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

    if (affectedCount === 0) {
      throw createError(
        'Комментарий не найден или нет прав на редактирование',
        404,
        'COMMENT_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return { comment: updatedComment.toJSON() };
  },

  /**
   * Удаляет комментарий.
   *
   * @param {number} commentId - Идентификатор комментария
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @returns {Promise<Object>} { message, commentId }.
   */
  async deleteComment(commentId, currentUserId) {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      throw createError('Комментарий не найден', 404, 'COMMENT_NOT_FOUND');
    }

    if (comment.userId !== currentUserId) {
      throw createError(
        'Вы не можете удалить этот комментарий',
        403,
        'FORBIDDEN'
      );
    }
    await Like.destroy({
      where: { targetType: 'Comment', targetId: commentId },
    });

    await comment.destroy();

    return { message: 'Комментарий успешно удален', commentId };
  },
};

module.exports = commentService;
