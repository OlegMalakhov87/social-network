const fs = require('fs').promises;
const { News, Like, Comment, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');
const temporaryMediaService = require('./temporaryMediaService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};

// Поля новости, которые можно обновлять
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

    //  Фильтр по категории
    if (category && category !== 'all') {
      where.category = category;
    }

    // Поиск по ключевому слову
    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
        { text: { [Op.iLike]: searchTerm } },
      ];
    }

    // Получаем новости с авторами, лайками и комментариями
    const { count, rows: news } = await News.findAndCountAll({
      where,
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
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    // Обогащаем новости данными о лайках и комментариях
    return {
      news: news.map((item) => ({
        ...item.toJSON(),
        likesCount: item.likes?.length,
        isLiked: item.likes?.some((like) => like.userId === currentUserId),
        commentsCount: item.comments?.length,
      })),
      // Получаем пагинацию для новостей
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
    // Получаем новость с автором, лайками и комментариями
    const news = await News.findByPk(newsId, {
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

    // Обогащаем новость данными о количестве лайков, комментариев и статусе лайка
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
    // Определяем новые медиа файлы
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

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(currentUserId, media);

    // Определяем данные для создания новости в базе данных
    const dbData = {
      title: newsData.title,
      text: newsData.text,
      category: newsData.category,
      type: newsData.type,
      source: newsData.source,
      newsUrl: newsData.newsUrl,
      previewUrl: newsData.previewUrl,
      thumbnailUrl: newsData.thumbnailUrl,
      uploadedBy: currentUserId,
      viewsCount: 0,
      isEdited: false,
    };

    // Создаем новость в базе данных
    const news = await News.create(dbData);

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, media);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа новости ${news.id}:`,
        error.message
      );
    }

    // Получаем созданную новость с автором одним запросом
    const newsWithAuthor = await News.findByPk(news.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return {
      news: (newsWithAuthor ?? news).toJSON(),
    };
  },

  /**
   * Обновить новость (владелец)
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Обновляемые данные
   * @returns {Promise<Object>} - { news }
   */
  async updateNews(newsId, currentUserId, updateData) {
    // Получаем новость с автором
    const news = await News.findByPk(newsId);

    // Проверяем, что новость найдена
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    // Проверяем, что пользователь является автором новости
    if (news.uploadedBy !== currentUserId) {
      throw createError('Вы не можете обновить эту новость', 403, 'FORBIDDEN');
    }

    // Выбираем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      NEWS_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
        (field) => [field, updateData[field]]
      )
    );

    // Проверяем, что есть данные для обновления
    if (Object.keys(dbUpdates).length === 0) {
      throw createError(
        'Нет данных для обновления',
        400,
        'NO_FIELDS_TO_UPDATE'
      );
    }

    // Определяем тип новости
    const nextType = updateData.type ?? news.type;

    // Устанавливаем флаг обновления
    dbUpdates.isEdited = true;

    // Определяем URL новости
    dbUpdates.newsUrl =
      nextType === 'text' ? null : (updateData.newsUrl ?? news.newsUrl);

    // Определяем URL превью
    dbUpdates.previewUrl =
      nextType === 'video' ? (updateData.previewUrl ?? news.previewUrl) : null;

    // Определяем URL thumbnail
    dbUpdates.thumbnailUrl =
      nextType === 'video'
        ? (updateData.thumbnailUrl ?? news.thumbnailUrl)
        : null;

    // Сравниваем новые и старые URL и получаем тольконовые URL
    const newTemporaryMedia = [
      {
        url: dbUpdates.newsUrl,
        fieldName: 'newsUrl',
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
      return url && url !== news[fieldName];
    });

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(
      currentUserId,
      newTemporaryMedia
    );

    // Обновляем новость
    let updatedNews;

    try {
      updatedNews = await news.update(dbUpdates);
    } catch (error) {
      // Если обновление новости не удалось, то удаляем новые медиа файлы
      try {
        await temporaryMediaService.removeMany(
          currentUserId,
          newTemporaryMedia
        );
      } catch (cleanupError) {
        // Если удаление новых медиа файлов не удалось, то логируем ошибку
        if (cleanupError.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить временные файлы для новости ${newsId}:`,
            cleanupError.message
          );
        }
      }
      throw createError('Не удалось обновить новость', 500, 'UPDATE_FAILED');
    }

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, newTemporaryMedia);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа новости ${newsId}:`,
        error.message
      );
    }

    return {
      news: updatedNews.toJSON(),
    };
  },

  /**
   *  Инкремент счетчика просмотров новости
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { success, viewsCount }
   */
  async incrementViewsCount(newsId) {
    // Инкрементируем счетчик просмотров новости
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
    // Получаем новость
    const news = await News.findOne({
      where: { id: newsId, uploadedBy: currentUserId },
    });

    // Проверяем, найдена ли новость
    if (!news) {
      throw createError(
        'Новость не найдено или нет прав на удаление',
        404,
        'NEWS_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Удаляем новость (медиа файлы автоматически удалит cleanup() из mediaCleanupService по рассписанию)
    await news.destroy();

    return { message: 'Новость успешно удалена', newsId };
  },
};

module.exports = newsService;
