const { sequelize, News, Like, Comment, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const temporaryMediaService = require('./temporaryMediaService');
const {
  deleteEntityWithRelations,
} = require('../utils/deleteEntityWithRelations');
const { validateMedia } = require('../utils/validateMedia');

/** Безопасный маппинг сортировки (защита от SQL-инъекций) */
const SORT_MAP = {
  dateDesc: { field: 'publishedAt', direction: 'DESC' },
  dateAsc: { field: 'publishedAt', direction: 'ASC' },
  viewsDesc: { field: 'viewsCount', direction: 'DESC' },
  viewsAsc: { field: 'viewsCount', direction: 'ASC' },
};

/** Срок хранения новостей в архиве */
const NEWS_RETENTION_DAYS = 30;

/** Поля новости, которые можно обновлять */
const NEWS_FIELDS = [
  'title',
  'text',
  'type',
  'source',
  'category',
  'newsUrl',
  'previewUrl',
  'thumbnailUrl',
];

const newsService = {
  /**
   * Получить новости
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество новостей на странице
   * @param {string} params.sortKey - Ключ сортировки
   * @param {string} params.category - Категория новостей
   * @param {string} params.q - Поисковый запрос
   * @param {number} params.currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - { news, pagination }
   */
  async getNews({
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
    category,
    q,
    currentUserId,
  } = {}) {
    const where = {};

    const sort = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

    const hasSearch = Boolean(q && q.trim().length >= 2);

    if (!hasSearch) {
      where.archivedAt = null;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (hasSearch) {
      const searchTerm = `%${q.trim()}%`;

      where[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
        { text: { [Op.iLike]: searchTerm } },
      ];
    }

    const { count, rows: news } = await News.findAndCountAll({
      where,
      attributes: {
        exclude: ['externalUrl', 'externalId', 'archivedAt', 'origin'],
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatarUrl'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
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
            {
              model: Like,
              as: 'likes',
              attributes: ['id', 'userId'],
            },
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
      news: news.map((item) => ({
        ...item.toJSON(),
        likesCount: item.likes?.length,
        isLiked: item.likes?.some((like) => like.userId === currentUserId),
        commentsCount: item.comments?.length,
      })),
      pagination: {
        totalNews: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получить новость по ID для кнопки "Поделиться"
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - { news }
   */
  async getNewsById(newsId, currentUserId) {
    const news = await News.findByPk(newsId, {
      attributes: {
        exclude: ['externalUrl', 'externalId', 'archivedAt', 'origin'],
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatarUrl'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
        { model: Comment, as: 'comments', attributes: ['id', 'userId'] },
      ],
    });

    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    return {
      news: {
        ...news.toJSON(),
        likesCount: news.likes?.length,
        isLiked: news.likes?.some((like) => like.userId === currentUserId),
        commentsCount: news.comments?.length,
      },
    };
  },

  /**
   * Создать новость (текущий пользователь является автором)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} newsData - Данные новости
   * @returns {Promise<Object>} - { news }
   */
  async createNews(currentUserId, newsData) {
    validateMedia({
      type: newsData.type,
      mediaUrl: newsData.newsUrl,
      previewUrl: newsData.previewUrl,
      thumbnailUrl: newsData.thumbnailUrl,
    });

    const media = [
      {
        url: newsData.newsUrl,
        fieldName: 'newsUrl',
      },
      {
        url: newsData.previewUrl,
        fieldName: 'previewUrl',
      },
      {
        url: newsData.thumbnailUrl,
        fieldName: 'thumbnailUrl',
      },
    ];

    const dbData = {
      uploadedBy: currentUserId,
      title: newsData.title,
      text: newsData.text,
      category: newsData.category,
      type: newsData.type,
      newsUrl: newsData.newsUrl,
      previewUrl: newsData.previewUrl,
      thumbnailUrl: newsData.thumbnailUrl,
      source: newsData.source,
      origin: 'manual',
      externalUrl: null,
      externalId: null,
      publishedAt: new Date(),
      isEdited: false,
      archivedAt: null,
      viewsCount: 0,
    };

    return sequelize.transaction(async (transaction) => {
      await temporaryMediaService.commitMany(currentUserId, media, {
        transaction,
      });

      const news = await News.create(dbData, { validate: true, transaction });

      const newsWithAuthor = await News.findByPk(news.id, {
        attributes: {
          exclude: ['externalUrl', 'externalId', 'archivedAt', 'origin'],
        },
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name', 'avatarUrl'],
          },
        ],
        transaction,
      });

      return { news: newsWithAuthor.toJSON() };
    });
  },

  /**
   * Обновить новость (владелец)
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Обновляемые данные
   * @returns {Promise<Object>} - { news }
   */
  async updateNews(newsId, currentUserId, updateData) {
    return sequelize.transaction(async (transaction) => {
      const news = await News.findByPk(newsId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!news) {
        throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
      }

      if (news.uploadedBy !== currentUserId) {
        throw createError(
          'Вы не можете обновить эту новость',
          403,
          'FORBIDDEN'
        );
      }

      const dbUpdates = Object.fromEntries(
        NEWS_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
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

      const nextType = dbUpdates.type ?? news.type;
      const typeChanged = nextType !== news.type;

      const getNextUrl = (fieldName) => {
        if (Object.hasOwn(dbUpdates, fieldName)) {
          return dbUpdates[fieldName];
        }

        return typeChanged ? null : news[fieldName];
      };

      const nextMedia = {
        type: nextType,
        newsUrl: nextType === 'text' ? null : getNextUrl('newsUrl'),
        previewUrl: nextType === 'video' ? getNextUrl('previewUrl') : null,
        thumbnailUrl: nextType === 'video' ? getNextUrl('thumbnailUrl') : null,
      };

      validateMedia({
        type: nextMedia.type,
        mediaUrl: nextMedia.newsUrl,
        previewUrl: nextMedia.previewUrl,
        thumbnailUrl: nextMedia.thumbnailUrl,
      });

      Object.assign(dbUpdates, {
        newsUrl: nextMedia.newsUrl,
        previewUrl: nextMedia.previewUrl,
        thumbnailUrl: nextMedia.thumbnailUrl,
        isEdited: true,
      });

      const mediaFields = ['newsUrl', 'previewUrl', 'thumbnailUrl'];

      const newTemporaryMedia = mediaFields
        .filter((fieldName) => {
          return (
            Object.hasOwn(dbUpdates, fieldName) &&
            dbUpdates[fieldName] &&
            dbUpdates[fieldName] !== news[fieldName]
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

      const updatedNews = await news.update(dbUpdates, {
        validate: true,
        transaction,
      });

      const updatedNewsWithAuthor = await News.findByPk(updatedNews.id, {
        attributes: {
          exclude: ['externalUrl', 'externalId', 'archivedAt', 'origin'],
        },
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name', 'avatarUrl'],
          },
        ],
        transaction,
      });

      return { news: updatedNewsWithAuthor.toJSON() };
    });
  },

  /**
   *  Инкремент счетчика просмотров новости
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { success, viewsCount }
   */
  async incrementViewsCount(newsId) {
    await News.increment('viewsCount', {
      by: 1,
      where: { id: newsId },
    });

    return { success: true };
  },

  /**
   * Удалить новость (владелец)
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - { message, newsId }
   */
  async deleteNews(newsId, currentUserId) {
    const news = await News.findOne({
      where: { id: newsId, uploadedBy: currentUserId },
    });

    if (!news) {
      throw createError(
        'Новость не найдено или нет прав на удаление',
        404,
        'NEWS_NOT_FOUND_OR_FORBIDDEN'
      );
    }
    const result = await deleteEntityWithRelations({
      entity: news,
      targetType: 'News',
    });

    return {
      message: 'Новость успешно удалена',
      newsId,
      deleted: result.deleted,
    };
  },

  /**
   * Архивировать новости старше {NEWS_RETENTION_DAYS} дней
   * @returns {Promise<number>} Количество архивированных новостей
   */
  async archiveOldNews() {
    const cutoffDate = new Date(
      Date.now() - NEWS_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    const [archivedCount] = await News.update(
      {
        archivedAt: new Date(),
      },
      {
        where: {
          archivedAt: null,
          createdAt: {
            [Op.lte]: cutoffDate,
          },
        },
      }
    );

    console.log(
      '[NewsService] Архивированно новостей:',
      archivedCount,
      'Дата архивации:',
      cutoffDate.toISOString()
    );

    return archivedCount;
  },
};

module.exports = newsService;
