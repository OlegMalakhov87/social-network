const fs = require('fs').promises;
const path = require('path');
const { News, Like, Comment, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};

const newsService = {
  /**
   * Получить новости
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество новостей на странице
   * @param {string} params.sortKey - Ключ сортировки
   * @param {string} params.category - Категория новостей
   * @param {string} params.q - Поисковый запрос
   * @returns {Promise<Object>} - { news, pagination }
   */
  async getNews({
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
    category,
    q,
  } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
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

    // Безопасная сортировка
    const order = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

    const { count, rows: news } = await News.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatar'],
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
              attributes: ['id', 'name', 'avatar'],
            },
            {
              model: Like,
              as: 'likes',
              attributes: ['id', 'userId'],
            },
          ],
        },
      ],
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Обогащаем новости данными о лайках и комментариях
    return {
      news: news.map((item) => ({
        ...item.toJSON(),
        likesCount: item.likes?.length,
        commentsCount: item.comments?.length,
      })),
      pagination: {
        totalNews: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Получить новость по ID
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { news }
   */
  async getNewsById(newsId) {
    const news = await News.findByPk(newsId, {
      include: [
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
        {
          model: Comment,
          as: 'comments',
          order: [['createdAt', 'ASC']],
          attributes: ['id', 'userId'],
        },
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
        commentsCount: news.comments?.length,
      },
    };
  },

  /**
   * Создать новость
   * @param {Object} newsData - Данные новости
   * @returns {Promise<Object>} - { news }
   */
  async createNews(newsData, userId) {
    const dbData = {
      uploadedBy: userId,
      title: newsData.title?.trim(),
      text: newsData.text?.trim(),
      date: newsData.date || new Date().toISOString().split('T')[0],
      author: newsData.author?.trim(),
      category: newsData.category?.trim(),
      source: newsData.source ? newsData.source.trim() : null,
      media: newsData.media || null,
      type: newsData.type || 'text',
      viewsCount: 0,
    };

    if (
      !dbData.title ||
      !dbData.text ||
      !dbData.author ||
      !dbData.category ||
      !dbData.uploadedBy ||
      !dbData.type ||
      !dbData.viewsCount
    ) {
      throw createError(
        'Поля title, text, author, category, uploadedBy, type, viewsCount обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    const news = await News.create(dbData);
    return { news: news.toJSON() };
  },

  /**
   * Увеличить счетчик просмотров новости на 1
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { success, viewsCount }
   */
  async incrementViewsCount(newsId) {
    const news = await News.findByPk(newsId);
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    await news.increment('viewsCount', { by: 1 });

    await news.reload();

    return { success: true, viewsCount: news.viewsCount };
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
   * Обновить новость
   * @param {number} newsId - ID новости
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - { news }
   */
  async updateNews(newsId, updates, userId) {
    const news = await News.findByPk(newsId);
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    if (news.uploadedBy !== userId) {
      throw createError('Вы не можете обновить эту новость', 403, 'FORBIDDEN');
    }

    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.text !== undefined) {
      dbUpdates.text = updates.text.trim();
    }
    if (updates.category !== undefined)
      dbUpdates.category = updates.category.trim();
    if (updates.author !== undefined) dbUpdates.author = updates.author.trim();
    if (updates.source !== undefined)
      dbUpdates.source = updates.source.trim() || null;
    if (updates.media !== undefined) {
      dbUpdates.media = updates.media || null;
    }
    if (updates.type !== undefined) dbUpdates.type = updates.type;

    if (updates.media !== undefined) {
      const newMedia = updates.media;

      if (newMedia !== news.media && news.media) {
        const oldFilePath = path.join(__dirname, '../../', news.media);

        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn(
            `Не удалось удалить старое медиа новости ${oldFilePath}:`,
            err.message
          );
        }
      }
      dbUpdates.media = newMedia;
    }

    delete dbUpdates.viewsCount;

    if (Object.keys(dbUpdates).length === 0) {
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');
    }

    // Оптимизация: обновляем и возвращаем результат одним запросом (PostgreSQL)
    const [, updatedRows] = await News.update(dbUpdates, {
      where: { id: newsId },
      returning: true,
      plain: true,
    });

    return { news: updatedRows.toJSON() };
  },

  /**
   * Удалить новость
   * @param {number} newsId - ID новости
   * @returns {Promise<Object>} - { message, newsId }
   */
  async deleteNews(newsId, userId) {
    const news = await News.findByPk(newsId);
    if (!news) {
      throw createError('Новость не найдена', 404, 'NEWS_NOT_FOUND');
    }

    if (news.uploadedBy !== userId) {
      throw createError('Вы не можете удалить эту новость', 403, 'FORBIDDEN');
    }

    await news.destroy();
    return { message: 'Новость успешно удалена', newsId };
  },
};

module.exports = newsService;
