const fs = require('fs').promises;
const { News, Like, Comment, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

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
        { author: { [Op.iLike]: searchTerm } },
      ];
    }

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
      pagination: {
        totalNews: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получить новость по ID
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - { news }
   */
  async getNewsById(newsId, currentUserId) {
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

    // Обогащаем новость данными о лайках и комментариях
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
   * Создать новость
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} newsData - Данные новости
   * @returns {Promise<Object>} - { news }
   */
  async createNews(currentUserId, newsData) {
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

    const news = await News.create(dbData);

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

    return { news: newsWithAuthor.toJSON() };
  },

  /**
   * Обновить новость
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Обновляемые данные
   * @returns {Promise<Object>} - { news }
   */
  async updateNews(newsId, currentUserId, updateData) {
    const news = await News.findByPk(newsId);
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    if (news.uploadedBy !== currentUserId) {
      throw createError('Вы не можете обновить эту новость', 403, 'FORBIDDEN');
    }

    // Выбираем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      NEWS_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
        (field) => [field, updateData[field]]
      )
    );

    const nextType = updateData.type ?? news.type;

    dbUpdates.isEdited = true;

    dbUpdates.newsUrl =
      nextType === 'text' ? null : (updateData.newsUrl ?? news.newsUrl);

    dbUpdates.previewUrl =
      nextType === 'video' ? (updateData.previewUrl ?? news.previewUrl) : null;

    dbUpdates.thumbnailUrl =
      nextType === 'video'
        ? (updateData.thumbnailUrl ?? news.thumbnailUrl)
        : null;

    const [, updatedNews] = await News.update(dbUpdates, {
      where: { id: newsId },
      returning: true,
      plain: true,
    });

    const oldMedia = [news.newsUrl, news.previewUrl, news.thumbnailUrl];

    const newMedia = [
      updatedNews.newsUrl,
      updatedNews.previewUrl,
      updatedNews.thumbnailUrl,
    ];

    for (const oldUrl of oldMedia) {
      if (!oldUrl || newMedia.includes(oldUrl)) {
        continue;
      }

      const filePath = fromPublicUrl(oldUrl);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа новости ${oldUrl}:`,
            error.message
          );
        }
      }
    }

    const newsWithAuthor = await News.findByPk(updatedNews.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return {
      news: newsWithAuthor.toJSON(),
    };
  },

  /**
   *  Инкремент счетчика просмотров видео
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { success, viewsCount }
   */
  async incrementViewsCount(newsId) {
    await News.increment('viewsCount', {
      by: 1,
      where: { id: newsId },
    });
    const updated = await News.findByPk(newsId, {
      attributes: ['viewsCount'],
    });

    return { success: true, viewsCount: updated.viewsCount };
  },

  /**
   * Удалить новость (владелец)
   * @param {number} newsId - ID новости
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - { message, newsId }
   */
  async deleteNews(newsId, currentUserId) {
    const news = await News.findByPk(newsId);
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    if (news.uploadedBy !== currentUserId) {
      throw createError('Вы не можете удалить эту новость', 403, 'FORBIDDEN');
    }

    const oldMedia = [news.newsUrl, news.previewUrl, news.thumbnailUrl];

    await news.destroy();

    // Логика очистки старого медиа файла
    for (const url of oldMedia) {
      if (!url) continue;

      const filePath = fromPublicUrl(url);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа новости ${url}:`,
            error.message
          );
        }
      }
    }

    return { message: 'Новость успешно удалена', newsId };
  },

  /**
   * Удаление (очистка мусора) загруженных медиа файлов в случае если пользователь отказался добавлять новость
   * @param {string} newsUrl - URL медиа файла
   * @param {string} previewUrl - URL превью медиа файла
   * @param {string} thumbnailUrl - URL thumbnail медиа файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedMedia({ newsUrl, previewUrl, thumbnailUrl }) {
    const urls = [newsUrl, previewUrl, thumbnailUrl];

    for (const url of urls) {
      if (!url) continue;

      const filePath = fromPublicUrl(url);

      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
    return { message: 'Загруженные медиа файлы успешно удалены' };
  },
};

module.exports = newsService;
