const fs = require('fs').promises;
const { Post, User, Friend, Like, Comment } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');
const temporaryMediaService = require('./temporaryMediaService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['likesCount', 'DESC']],
  viewsAsc: [['likesCount', 'ASC']],
};

// Поля поста, которые можно обновлять
const POST_FIELDS = [
  'text',
  'type',
  'postUrl',
  'previewUrl',
  'thumbnailUrl',
  'isPublic',
  'pinned',
];

const postService = {
  /**
   * Получение постов пользователя
   * @param {Object} params - Параметры запроса
   * @param {number} params.targetUserId - ID пользователя
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество постов на странице
   * @param {string} params.sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с постами и пагинацией
   */
  async getUserPosts({
    targetUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
  } = {}) {
    // Проверяем, является ли текущий пользователь владельцем постов
    const isOwner = currentUserId === targetUserId;
    let isFriend = false;

    // Если текущий пользователь не является владельцем постов, то проверяем дружбу с пользователем
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
      // Проверяем, является ли текущий пользователь другом
      isFriend = !!friendship;
    }

    // Создаем условие для поиска постов
    const where = { userId: targetUserId };

    // Если это НЕ владелец и НЕ друг, то показываем только публичные посты
    if (!isOwner && !isFriend) {
      where.isPublic = true;
    }

    // Получаем посты и количество постов с авторами, лайками и комментариями
    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
        {
          model: Comment,
          as: 'comments',
          limit: 100,
          order: [['createdAt', 'ASC']],
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

    // Обогащаем посты данными о количестве лайков, комментариев и статусе лайка
    return {
      posts: posts.map((post) => ({
        ...post.toJSON(),
        likesCount: post.likes?.length,
        isLiked: post.likes?.some((like) => like.userId === currentUserId),
        commentsCount: post.comments?.length,
      })),
      // Получаем пагинацию для постов
      pagination: {
        totalPosts: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получение поста по ID для кнопки "Поделиться"
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с постом
   */
  async getPostById(postId, currentUserId) {
    // Получаем пост с автором, лайками и комментариями
    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
        { model: Comment, as: 'comments', attributes: ['id', 'userId'] },
      ],
    });

    // Проверяем, найден ли пост
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    // Обогащаем пост данными о количестве лайков, комментариев и статусе лайка
    return {
      post: {
        ...post.toJSON(),
        likesCount: post.likes?.length,
        isLiked: post.likes?.some((like) => like.userId === currentUserId),
        commentsCount: post.comments?.length,
      },
    };
  },

  /**
   * Создание поста (текущий пользователь является автором)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} postData - Данные поста
   * @returns {Promise<Object>} - Объект с созданным постом
   */
  async createPost(currentUserId, postData) {
    // Определяем новые медиа файлы
    const media = [
      {
        url: postData.postUrl,
        fieldName: 'postUrl',
      },
      {
        url: postData.previewUrl,
        fieldName: 'previewUrl',
      },
      {
        url: postData.thumbnailUrl,
        fieldName: 'thumbnailUrl',
      },
    ];

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(currentUserId, media);

    // Определяем данные для создания поста в базе данных
    const dbData = {
      text: postData.text,
      type: postData.type,
      postUrl: postData.postUrl,
      previewUrl: postData.previewUrl,
      thumbnailUrl: postData.thumbnailUrl,
      pinned: postData.pinned,
      isPublic: postData.isPublic,
      isEdited: false,
      userId: currentUserId,
    };

    // Создаем пост в базе данных
    const post = await Post.create(dbData);

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, media);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа поста ${post.id}:`,
        error.message
      );
    }

    // Получаем созданный пост с автором одним запросом
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
      ],
    });

    return {
      post: (postWithAuthor ?? post).toJSON(),
    };
  },

  /**
   * Обновление приватности постов
   * @param {number} currentUserId - ID пользователя, обновляющего посты
   * @param {boolean} isPublic - Приватность постов
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updatePostPrivacy(currentUserId, { isPublic }) {
    // Обновляем приватность постов
    const [affectedCount] = await Post.update(
      { isPublic },
      { where: { userId: currentUserId } }
    );

    // Проверяем, найдены ли посты
    if (affectedCount === 0) {
      throw createError('Посты не найдены', 404, 'POSTS_NOT_FOUND');
    }

    // Возвращаем результат
    return {
      message: 'Приватность постов успешно обновлена',
      posts: affectedCount,
    };
  },

  /**
   * Обновление поста (владелец)
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Объект с обновленным постом
   */
  async updatePost(postId, currentUserId, updateData) {
    // Получаем пост с автором
    const post = await Post.findByPk(postId);

    // Проверяем, найден ли пост
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    // Проверяем, является ли текущий пользователь автором поста
    if (post.userId !== currentUserId) {
      throw createError(
        'Вы не можете редактировать этот пост',
        403,
        'FORBIDDEN'
      );
    }

    // Выбираем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      POST_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
        (field) => [field, updateData[field]]
      )
    );

    // Проверяем, есть ли данные для обновления
    if (Object.keys(dbUpdates).length === 0) {
      throw createError(
        'Нет данных для обновления',
        400,
        'NO_FIELDS_TO_UPDATE'
      );
    }

    // Определяем тип поста
    const nextType = updateData.type ?? post.type;

    // Устанавливаем флаг обновления
    dbUpdates.isEdited = true;

    // Обновляем URL поста
    dbUpdates.postUrl =
      nextType === 'text' ? null : (updateData.postUrl ?? post.postUrl);

    // Обновляем URL превью
    dbUpdates.previewUrl =
      nextType === 'video' ? (updateData.previewUrl ?? post.previewUrl) : null;

    // Обновляем URL thumbnail
    dbUpdates.thumbnailUrl =
      nextType === 'video'
        ? (updateData.thumbnailUrl ?? post.thumbnailUrl)
        : null;

    // Сравниваем новые и старые URL и получаем тольконовые URL
    const newTemporaryMedia = [
      {
        url: dbUpdates.postUrl,
        fieldName: 'postUrl',
      },
      {
        url: dbUpdates.previewUrl,
        fieldName: 'previewUrl',
      },
      {
        url: dbUpdates.thumbnailUrl,
        fieldName: 'thumbnailUrl',
      },
    ].filter(({ url, fieldName }) => {
      return url && url !== post[fieldName];
    });

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(
      currentUserId,
      newTemporaryMedia
    );

    // Обновляем пост в базе данных
    let updatedPost;

    try {
      updatedPost = await post.update(dbUpdates);
    } catch (error) {
      // Если обновление поста не удалось, то удаляем новые медиа файлы
      try {
        await temporaryMediaService.removeMany(
          currentUserId,
          newTemporaryMedia
        );
      } catch (cleanupError) {
        // Если удаление новых медиа файлов не удалось, то логируем ошибку
        if (cleanupError.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить временные файлы для поста ${postId}:`,
            cleanupError.message
          );
        }
      }
      throw createError('Не удалось обновить пост', 500, 'UPDATE_FAILED');
    }

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, newTemporaryMedia);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа поста ${postId}:`,
        error.message
      );
    }

    return { post: updatedPost.toJSON() };
  },

  /**
   * Удаление поста (владелец)
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с сообщением об удалении
   */
  async deletePost(postId, currentUserId) {
    // Получаем пост
    const post = await Post.findByPk(postId);

    // Проверяем, найден ли пост
    if (!post) {
      throw createError('Пост не найден', 404, 'POST_NOT_FOUND');
    }

    // Проверяем, является ли текущий пользователь автором поста
    if (post.userId !== currentUserId) {
      throw createError('Вы не можете удалить этот пост', 403, 'FORBIDDEN');
    }

    // Удаляем пост (медиа файлы автоматически удалит cleanup() из mediaCleanupService по рассписанию)
    await post.destroy();

    return { message: 'Пост успешно удален', postId };
  },
};

module.exports = postService;
