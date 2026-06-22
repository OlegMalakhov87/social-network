const { News, Like, Comment, User } = require('../../db/models');
const { Op } = require('sequelize');
const newsController = {
  // ==================== GET запросы ====================

  // 1. Поиск новостей
  searchNews: async (req, res) => {
    try {
      const { q, page = 1, limit = 30 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: 'Поисковый запрос должен содержать минимум 2 символа',
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchTerm = `%${q}%`;

      const { count, rows: news } = await News.findAndCountAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: searchTerm } },
            { content: { [Op.iLike]: searchTerm } },
            { author: { [Op.iLike]: searchTerm } },
            { category: { [Op.iLike]: searchTerm } },
          ],
        },
        include: [
          {
            model: Like,
            as: 'likes',
            attributes: ['id', 'userId'],
          },
          {
            model: Comment,
            as: 'comments',
            limit: 100,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'photoUrl'],
              },
              {
                model: Like,
                as: 'likes',
                attributes: ['id', 'userId'],
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
        order: [['date', 'DESC']],
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      res.json({
        query: q,
        pagination: {
          totalNews: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          hasMore: parseInt(page) * parseInt(limit) < count,
        },
      });
    } catch (error) {
      console.error('GET /news/search error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Все новости (с пагинацией)
  getAllNews: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;
      const { category, q } = req.query;

      const where = {};
      if (category) where.category = category;

      // Поиск по ключевому слову (если передан)
      if (q && q.trim().length > 0) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { content: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
          { category: { [Op.iLike]: `%${q}%` } },
        ];
      }

      const { count, rows: news } = await News.findAndCountAll({
        where,
        include: [
          {
            model: Like,
            as: 'likes',
            attributes: ['id', 'userId'],
          },
          {
            model: Comment,
            as: 'comments',
            limit: 100,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'photoUrl'],
              },
              {
                model: Like,
                as: 'likes',
                attributes: ['id', 'userId'],
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      res.json({
        news,
        pagination: {
          totalNews: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /news error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Одна новость по ID
  getNewsById: async (req, res) => {
    try {
      const { newsId } = req.params;

      const news = await News.findByPk(newsId, {
        include: [
          {
            model: Like,
            as: 'likes',
            include: [
              {
                model: User,
                as: 'users',
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!news) {
        return res.status(404).json({ error: 'Новость не найдена' });
      }

      // Увеличиваем счетчик просмотров
      await news.increment('viewCount', { by: 1 });

      // Форматируем ответ
      const newsWithStats = {
        ...news.toJSON(),
        stats: {
          likesCount: news.likes.length,
          commentsCount: news.comments.length,
          viewsCount: news.viewCount + 1,
        },
      };

      res.json(newsWithStats);
    } catch (error) {
      console.error('GET /news/:newsId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Новости по категории
  getCategoryNews: async (req, res) => {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: news } = await News.findAndCountAll({
        where: { category },
        include: [
          {
            model: Like,
            as: 'likes',
            attributes: ['id'],
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id'],
          },
        ],
        order: [['date', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      res.json({
        category,
        news: news.map((item) => ({
          ...item.toJSON(),
          stats: {
            likesCount: item.likes.length,
            commentsCount: item.comments.length,
          },
        })),
        pagination: {
          totalNews: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /news/category/:cat error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 5. Создать новость
  createNews: async (req, res) => {
    try {
      const { title, content, date, author, category, source, imageUrl } = req.body;

      if (!title || !content || !author || !category) {
        return res.status(400).json({
          error: 'Поля title, content, author, category обязательны',
        });
      }

      const news = await News.create({
        title: title.trim(),
        content: content.trim(),
        date: date || new Date().toISOString().split('T')[0],
        author: author.trim(),
        category: category.trim(),
        source: source ? source.trim() : null,
        imageUrl: imageUrl || null,
        viewCount: 0,
      });

      res.status(201).json(news);
    } catch (error) {
      console.error('POST /news error:', error);

      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== PUT запросы ====================

  // 6. Увеличение счетчика просмотров
  incrementViewCount: async (req, res) => {
    try {
      const { newsId } = req.params;
      const news = await News.findByPk(newsId);
      if (!news) return res.status(404).json({ error: 'Новость не найдена' });

      await news.increment('viewCount', { by: 1 });
      res.json({ success: true, viewCount: news.viewCount + 1 });
    } catch (error) {
      console.error('PUT /news/:newsId/view error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 7. Обновить новость
  updateNews: async (req, res) => {
    try {
      const { newsId } = req.params;
      const updates = req.body;

      const news = await News.findByPk(newsId);

      if (!news) {
        return res.status(404).json({ error: 'Новость не найдена' });
      }

      // Не позволяем обновлять viewCount через PUT
      delete updates.viewCount;

      await news.update(updates);

      res.json(news);
    } catch (error) {
      console.error('PUT /news/:newsId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE запросы ====================

  // 8. Удалить новость
  deleteNews: async (req, res) => {
    try {
      const { newsId } = req.params;

      const news = await News.findByPk(newsId);

      if (!news) {
        return res.status(404).json({ error: 'Новость не найдена' });
      }

      await news.destroy();

      res.json({
        success: true,
        message: 'Новость удалена',
        newsId,
      });
    } catch (error) {
      console.error('DELETE /news/:newsId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = newsController;
