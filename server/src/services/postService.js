const fs = require('fs').promises;
const path = require('path');
const { Post, User, Friend, Like, Comment } = require('../../db/models');
const { Op } = require('sequelize');
const createError = require('../utils/createError');
const fromPublicUrl = require('../utils/fromPublicUrl');

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
      ...postData,
      userId: currentUserId,
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
   * Обновление приватности постов
   * @param {number} currentUserId - ID пользователя, обновляющего посты
   * @param {boolean} isPublic - Приватность постов
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updatePostPrivacy(currentUserId, { isPublic }) {
    const [affectedCount] = await Post.update(
      { isPublic },
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
   * Обновление поста
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Объект с обновленным постом
   */
  async updatePost(postId, currentUserId, updateData) {
    const post = await Post.findByPk(postId);

    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    if (post.userId !== currentUserId) {
      throw createError(
        'Вы не можете редактировать этот пост',
        403,
        'FORBIDDEN'
      );
    }

    const nextType = updateData.type ?? post.type;

    const dbUpdates = {
      isEdited: true,
      postUrl: nextType === 'text' ? null : (updateData.postUrl ?? null),
      previewUrl: nextType === 'video' ? (updateData.previewUrl ?? null) : null,
      thumbnailUrl:
        nextType === 'video' ? (updateData.thumbnailUrl ?? null) : null,
    };

    const [, updatedPost] = await Post.update(dbUpdates, {
      where: { id: postId },
      returning: true,
      plain: true,
    });

    const oldMedia = [post.postUrl, post.previewUrl, post.thumbnailUrl];

    const newMedia = [
      updatedPost.postUrl,
      updatedPost.previewUrl,
      updatedPost.thumbnailUrl,
    ];

    for (const oldUrl of oldMedia) {
      if (!oldUrl || newMedia.includes(oldUrl)) {
        continue;
      }

      try {
        const filePath = fromPublicUrl(oldUrl);
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа поста ${oldUrl}:`,
            error.message
          );
        }
      }
    }

    const postWithAuthor = await Post.findByPk(updatedPost.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return {
      post: postWithAuthor.toJSON(),
    };
  },

  /**
   * Удаление поста (владелец)
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

    await post.destroy();

    // Логика очистки старого медиа файла
    for (const url of [post.postUrl, post.previewUrl, post.thumbnailUrl]) {
      if (!url) continue;

      try {
        await fs.unlink(fromPublicUrl(url));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`Не удалось удалить медиа поста ${url}:`, error.message);
        }
      }
    }

    return { message: 'Пост успешно удален', postId };
  },

  /**
   * Удаление (очистка мусора) загруженных медиа файлов в случае если пользователь отказался добавлять пост
   * @param {string} postUrl - URL медиа файла
   * @param {string} previewUrl - URL превью медиа файла
   * @param {string} thumbnailUrl - URL thumbnail медиа файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedMedia({ postUrl, previewUrl, thumbnailUrl }) {
    const urls = [postUrl, previewUrl, thumbnailUrl];
    for (const url of urls) {
      if (!url) continue;
      const filePath = fromPublicUrl(url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  },
};

module.exports = postService;
