const newsService = require('../services/newsService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');

const newsController = {
  /**
   * Получение новостей
   */
  getNews: async (req, res, next) => {
    try {
      const { page, limit, sortKey, category, q } = req.query;
      const currentUserId = req.user?.id;

      const result = await newsService.getNews({
        page: parseInt(page),
        limit: parseInt(limit),
        sortKey,
        category,
        q,
        currentUserId: parseInt(currentUserId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить новость по ID
   */
  getNewsById: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = req.user?.id;
      const result = await newsService.getNewsById(
        parseInt(newsId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание новости
   */
  createNews: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await newsService.createNews(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление новости
   */
  updateNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = req.user?.id;
      const result = await newsService.updateNews(
        parseInt(newsId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличение счетчика просмотров новости
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.incrementViewsCount(parseInt(newsId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить новость
   */
  deleteNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = req.user?.id;
      const result = await newsService.deleteNews(
        parseInt(newsId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление (очистка мусора) загруженных медиа файлов
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      await newsService.deleteUploadedMedia(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка медиа файла
   */
  uploadMedia: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }
      const newsUrl = req.file.path;

      let previewUrl = null;
      let thumbnailUrl = null;

      if (req.file.mimetype.startsWith('video/')) {
        const newsMetadata = await mediaService.getMetadata(newsUrl);
        const previewPath = await videoPreviewService.generatePreview(
          newsUrl,
          newsMetadata.duration
        );

        const thumbnailPath = await videoPreviewService.generateThumbnail(
          newsUrl,
          newsMetadata.duration
        );

        previewUrl = toPublicUrl(previewPath);
        thumbnailUrl = toPublicUrl(thumbnailPath);
      }

      return res.status(200).json({
        newsUrl: toPublicUrl(newsUrl),
        previewUrl,
        thumbnailUrl,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = newsController;
