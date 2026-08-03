const newsService = require('../services/newsService');

const newsController = {
  /**
   * Получить новости
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getNews: async (req, res, next) => {
    try {
      const result = await newsService.getNews(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить новость по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getNewsById: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.getNewsById(newsId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создать новость
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  createNews: async (req, res, next) => {
    try {
      const result = await newsService.createNews(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличить счетчик просмотров новости на 1
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.incrementViewsCount(newsId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка медиа файла
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  uploadMedia: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }
      const result = await newsService.uploadMedia(req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить новость
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.updateNews(
        newsId,
        req.body,
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить новость
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  deleteNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.deleteNews(newsId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = newsController;
