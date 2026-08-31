const fs = require('fs').promises;
const path = require('path');
const { Post, User, Friend, Like, Comment } = require('../../db/models');
const { Op } = require('sequelize');
const createError = require('../utils/createError');

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

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
        {
          model: Comment,
          as: 'comments',
          limit: 100,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatarUrl'],
            },
            { model: Like, as: 'likes', attributes: ['id', 'userId'] },
          ],
        },
      ],
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    // Обогащаем посты данными о количестве лайков и комментариев
    return {
      posts: posts.map((post) => ({
        ...post.toJSON(),
        likesCount: post.likes?.length ?? 0,
        isLiked:
          post.likes?.some((like) => like.userId === currentUserId) ?? false,
        commentsCount: post.comments?.length ?? 0,
      })),
      pagination: {
        totalPosts: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
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
  async getPostById(postId, currentUserId) {
    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
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
        likesCount: post.likes?.length ?? 0,
        isLiked:
          post.likes?.some((like) => like.userId === currentUserId) ?? false,
        commentsCount: post.comments?.length ?? 0,
      },
    };
  },

  /**
   * Создание поста
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} postData - Данные поста
   * @returns {Promise<Object>} - Объект с созданным постом
   */
  async createPost(currentUserId, postData) {
    const dbData = {
      userId: currentUserId,
      text: postData.text || null,
      isPublic: postData.isPublic ?? true,
      type: postData.type || 'text',
      postUrl: postData.postUrl || null,
      pinned: postData.pinned ?? false,
      isEdited: false,
    };

    const post = await Post.create(dbData);

    // Получаем созданный пост с автором одним запросом
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
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
    const postUrl = `/${file.path}`;

    return { postUrl };
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
    const updates = { isEdited: true };
    if (updateData.text !== undefined && updateData.text !== null) {
      updates.text = updateData.text.trim();
    }
    if (updateData.isPublic !== undefined && updateData.isPublic !== null)
      updates.isPublic = updateData.isPublic;

    if (updateData.type !== undefined && updateData.type !== null) {
      updates.type = updateData.type;
    }

    if (updateData.pinned !== undefined && updateData.pinned !== null) {
      updates.pinned = updateData.pinned;
    }

    if (updateData.postUrl !== undefined && updateData.postUrl !== null) {
      const newPostUrl = updateData.postUrl;

      if (newPostUrl !== post.postUrl && post.postUrl) {
        const oldPostUrl = path.join(__dirname, '../../', post.postUrl);

        try {
          await fs.unlink(oldPostUrl);
        } catch (err) {
          console.warn(
            `Не удалось удалить старое медиа поста ${oldPostUrl}:`,
            err.message
          );
        }
      }
      updates.postUrl = newPostUrl;
    }

    if (Object.keys(updates).length === 0) {
      throw createError(
        'Не указаны поля для обновления',
        400,
        'NO_UPDATE_DATA'
      );
    }

    // Обновляем пост и возвращаем результат одним запросом
    const [, updatedRows] = await Post.update(updates, {
      where: { id: postId },
      returning: true,
      plain: true,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
      ],
    });

    return { post: updatedRows.toJSON() };
  },

  /**
   * Обновление приватности постов
   * @param {number} currentUserId - ID пользователя, обновляющего посты
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updatePostPrivacy(currentUserId, updates) {
    const [affectedCount] = await Post.update(
      { isPublic: updates.isPublic },
      { where: { userId: currentUserId } }
    );

    if (affectedCount === 0) {
      throw createError('Посты не найдены', 404, 'POSTS_NOT_FOUND');
    }

    return {
      message: 'Приватность постов успешно обновлена',
      posts: affectedCount,
    };
  },

  /**
   * Удаление поста
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с сообщением об удалении
   */
  async deletePost(postId, currentUserId) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    if (post.userId !== currentUserId) {
      throw createError('Вы не можете удалить этот пост', 403, 'FORBIDDEN');
    }

    // Логика очистки старой обложки
    if (post.postUrl !== undefined && post.postUrl !== null) {
      const oldPostUrl = path.join(__dirname, '../../', post.postUrl);
      try {
        await fs.unlink(oldPostUrl);
      } catch (err) {
        console.warn('Не удалось удалить старый медиа файл:', err.message);
      }
    }
    await post.destroy();
    return { message: 'Пост успешно удален', postId };
  },
};

module.exports = postService;
