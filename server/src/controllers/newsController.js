const newsService = require('../services/newsService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
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
   * Загрузка медиа файла
   */
  uploadMedia: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }

      const currentUserId = parseInt(req.user?.id);
      const mediaPath = req.file.path;

      let newsUrl = null;
      let previewUrl = null;
      let thumbnailUrl = null;

      // Генерируем медиа файлы для видео и сохраняем в temporaryMediaService
      if (req.file.mimetype.startsWith('video/')) {
        // Получаем метаданные видео
        const newsMetadata = await mediaService.getMetadata(mediaPath);

        // Генерируем превью видео
        const previewPath = await videoPreviewService.generatePreview(
          mediaPath,
          newsMetadata.duration
        );

        // Генерируем обложку видео
        const thumbnailPath = await videoPreviewService.generateThumbnail(
          mediaPath,
          newsMetadata.duration
        );

        newsUrl = toPublicUrl(mediaPath);
        previewUrl = toPublicUrl(previewPath);
        thumbnailUrl = toPublicUrl(thumbnailPath);

        // Сохраняем медиа файлы в temporaryMediaService
        await temporaryMediaService.registerMany([
          {
            userId: currentUserId,
            url: newsUrl,
            mediaType: 'video',
            fieldName: 'newsUrl',
          },
          {
            userId: currentUserId,
            url: previewUrl,
            mediaType: 'video',
            fieldName: 'previewUrl',
          },
          {
            userId: currentUserId,
            url: thumbnailUrl,
            mediaType: 'image',
            fieldName: 'thumbnailUrl',
          },
        ]);
      }

      // Сохраняем медиа файлы в temporaryMediaService
      if (req.file.mimetype.startsWith('image/')) {
        newsUrl = toPublicUrl(mediaPath);
        
        await temporaryMediaService.registerMany([
          {
            userId: currentUserId,
            url: newsUrl,
            mediaType: 'image',
            fieldName: 'newsUrl',
          },
        ]);
      }

      return res.status(200).json({
        newsUrl,
        previewUrl,
        thumbnailUrl,
      });
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
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять новость
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const media = [
        {
          url: req.body?.newsUrl,
          fieldName: 'newsUrl',
        },
        {
          url: req.body?.previewUrl,
          fieldName: 'previewUrl',
        },
        {
          url: req.body?.thumbnailUrl,
          fieldName: 'thumbnailUrl',
        },
      ];
      const result = await temporaryMediaService.removeMany(
        currentUserId,
        media
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = newsController;
