const {
  sequelize,
  Post,
  User,
  Friend,
  Like,
  Comment,
} = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const temporaryMediaService = require('./temporaryMediaService');
const {
  deleteEntityWithRelations,
} = require('../utils/deleteEntityWithRelations');
const { validateMedia } = require('../utils/validateMedia');

/** Безопасный маппинг сортировки (защита от SQL-инъекций) */
const SORT_MAP = {
  dateDesc: { field: 'createdAt', direction: 'DESC' },
  dateAsc: { field: 'createdAt', direction: 'ASC' },
  viewsDesc: { field: 'likesCount', direction: 'DESC' },
  viewsAsc: { field: 'likesCount', direction: 'ASC' },
};

/** Поля поста, которые можно обновлять */
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

    if (!isOwner && !isFriend) {
      where.isPublic = true;
    }

    const sort = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

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
      order: [
        [sort.field, sort.direction],
        ['id', sort.direction],
      ],
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      posts: posts.map((post) => ({
        ...post.toJSON(),
        likesCount: post.likes?.length,
        isLiked: post.likes?.some((like) => like.userId === currentUserId),
        commentsCount: post.comments?.length,
      })),
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
    validateMedia({
      type: postData.type,
      mediaUrl: postData.postUrl,
      previewUrl: postData.previewUrl,
      thumbnailUrl: postData.thumbnailUrl,
    });

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

    return sequelize.transaction(async (transaction) => {
      await temporaryMediaService.commitMany(currentUserId, media, {
        transaction,
      });

      const post = await Post.create(dbData, { validate: true, transaction });

      const postWithAuthor = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatarUrl'],
          },
        ],
        transaction,
      });

      return { post: postWithAuthor.toJSON() };
    });
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
   * Обновление поста (владелец)
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Объект с обновленным постом
   */
  async updatePost(postId, currentUserId, updateData) {
    return sequelize.transaction(async (transaction) => {
      const post = await Post.findByPk(postId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

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

      const dbUpdates = Object.fromEntries(
        POST_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
          (field) => [field, updateData[field]]
        )
      );

      if (Object.keys(dbUpdates).length === 0) {
        throw createError(
          'Нет данных для обновления',
          400,
          'NO_FIELDS_TO_UPDATE'
        );
      }

      const nextType = dbUpdates.type ?? post.type;
      const typeChanged = nextType !== post.type;

      const getNextUrl = (fieldName) => {
        if (Object.hasOwn(dbUpdates, fieldName)) {
          return dbUpdates[fieldName];
        }

        return typeChanged ? null : post[fieldName];
      };

      const nextMedia = {
        type: nextType,
        postUrl: nextType === 'text' ? null : getNextUrl('postUrl'),
        previewUrl: nextType === 'video' ? getNextUrl('previewUrl') : null,
        thumbnailUrl: nextType === 'video' ? getNextUrl('thumbnailUrl') : null,
      };

      validateMedia({
        type: nextMedia.type,
        mediaUrl: nextMedia.postUrl,
        previewUrl: nextMedia.previewUrl,
        thumbnailUrl: nextMedia.thumbnailUrl,
      });

      Object.assign(dbUpdates, {
        postUrl: nextMedia.postUrl,
        previewUrl: nextMedia.previewUrl,
        thumbnailUrl: nextMedia.thumbnailUrl,
        isEdited: true,
      });

      const mediaFields = ['postUrl', 'previewUrl', 'thumbnailUrl'];

      const newTemporaryMedia = mediaFields
        .filter((fieldName) => {
          return (
            Object.hasOwn(dbUpdates, fieldName) &&
            dbUpdates[fieldName] &&
            dbUpdates[fieldName] !== post[fieldName]
          );
        })
        .map((fieldName) => ({
          url: dbUpdates[fieldName],
          fieldName,
        }));

      if (newTemporaryMedia.length > 0) {
        await temporaryMediaService.commitMany(
          currentUserId,
          newTemporaryMedia,
          { transaction }
        );
      }

      const updatedPost = await post.update(dbUpdates, {
        validate: true,
        transaction,
      });

      const updatedPostWithAuthor = await Post.findByPk(updatedPost.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatarUrl'],
          },
        ],
        transaction,
      });

      return { post: updatedPostWithAuthor.toJSON() };
    });
  },

  /**
   * Удаление поста (владелец)
   * @param {number} postId - ID поста
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с сообщением об удалении
   */
  async deletePost(postId, currentUserId) {
    const post = await Post.findOne({
      where: { id: postId, userId: currentUserId },
    });

    if (!post) {
      throw createError(
        'Пост не найден или нет прав на удаление',
        404,
        'POST_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    const result = await deleteEntityWithRelations({
      entity: post,
      targetType: 'Post',
    });

    return {
      message: 'Пост успешно удален',
      postId,
      deleted: result.deleted,
    };
  },
};

module.exports = postService;
