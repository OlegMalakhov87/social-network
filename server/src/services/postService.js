const fs = require('fs').promises;
const path = require('path');
const { Post, User, Friend, Like, Comment } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['likesCount', 'DESC']],
  viewsAsc: [['likesCount', 'ASC']],
};

const postService = {
  /**
   * Получение постов пользователя
   * @param {number} targetUserId - ID пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество постов на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с постами и пагинацией
   */
  async getUserPosts(
    targetUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    // Проверка на владение постом и дружбу с пользователем
    const isOwner = currentUserId === targetUserId;
    let isFriend = false;

    if (!isOwner) {
      const friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
          status: 'accepted',
        },
      });
      isFriend = !!friendship;
    }

    const where = { userId: targetUserId };

    // Если это НЕ владелец и НЕ друг, то показываем только публичные посты
    if (!isOwner && !isFriend) {
      where.isPublic = true;
    }

    // Безопасная сортировка
    const order = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
        {
          model: Comment,
          as: 'comments',
          limit: 100,
          order: [['createdAt', 'DESC']],
          include: [
            { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
            { model: Like, as: 'likes', attributes: ['id', 'userId'] },
          ],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    // Обогащаем посты данными о количестве лайков и комментариев
    return {
      posts: posts.map((post) => ({
        ...post.toJSON(),
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      })),
      pagination: {
        totalPosts: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
      isOwner,
      isFriend,
    };
  },

  /**
   * Получение поста по ID
   * @param {number} postId - ID поста
   * @returns {Promise<Object>} - Объект с постом
   */
  async getPostById(postId) {
    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
        { model: Comment, as: 'comments', attributes: ['id', 'userId'] },
      ],
    });

    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }
    return {
      post: {
        ...post.toJSON(),
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      },
    };
  },

  /**
   * Создание поста
   * @param {number} userId - ID пользователя
   * @param {Object} postData - Данные поста
   * @returns {Promise<Object>} - Объект с созданным постом
   */
  async createPost(userId, postData) {
    const dbData = {
      userId,
      text: postData.text || null,
      isPublic: postData.isPublic || true,
      type: postData.type || 'text',
      media: postData.media || null,
      pinned: postData.pinned || false,
    };

    const post = await Post.create(dbData);

    // Получаем созданный пост с автором одним запросом
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    return { post: postWithAuthor.toJSON() };
  },

  /**
   * Загрузка медиа файла
   * @param {Object} file - Файл
   * @returns {Promise<Object>} - Объект с URL медиа файла
   */
  async uploadMedia(file) {
    if (!file) {
      throw createError('Файл не предоставлен', 400, 'NO_FILE_PROVIDED');
    }
    const media = `/${file.path}`;

    return { media };
  },

  /**
   * Обновление поста
   * @param {number} postId - ID поста
   * @param {number} userId - ID пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Объект с обновленным постом
   */
  async updatePost(postId, userId, updateData) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    if (post.userId !== userId) {
      throw createError(
        'Вы не можете редактировать этот пост',
        403,
        'FORBIDDEN'
      );
    }

    // Маппинг полей для обновления
    const updates = {};
    if (updateData.text !== undefined) {
      updates.text = updateData.text.trim();
    }
    if (updateData.isPublic !== undefined)
      updates.isPublic = updateData.isPublic;

    if (updateData.type !== undefined) {
      updates.type = updateData.type;
    }
    if (updateData.media !== undefined) {
      updates.media = updateData.media;
    }
    if (updateData.pinned !== undefined) {
      updates.pinned = updateData.pinned;
    }
    if (updateData.media !== undefined) {
      const newMedia = updateData.media;

      if (newMedia !== post.media && post.media) {
        const oldFilePath = path.join(__dirname, '../../', post.media);

        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn(
            `Не удалось удалить старое медиа поста ${oldFilePath}:`,
            err.message
          );
        }
      }
      updates.media = newMedia;
    }

    if (Object.keys(updates).length === 0) {
      throw createError(
        'Не указаны поля для обновления',
        400,
        'NO_UPDATE_DATA'
      );
    }

    // Оптимизация: обновляем и возвращаем результат одним запросом (PostgreSQL)
    const [, updatedRows] = await Post.update(updates, {
      where: { id: postId },
      returning: true,
      plain: true,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    return { post: updatedRows.toJSON() };
  },

  /**
   * Удаление поста
   * @param {number} postId - ID поста
   * @param {number} userId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с сообщением об удалении
   */
  async deletePost(postId, userId) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    if (post.userId !== userId) {
      throw createError('Вы не можете удалить этот пост', 403, 'FORBIDDEN');
    }

    await post.destroy();
    return { message: 'Пост успешно удален', postId };
  },
};

module.exports = postService;
