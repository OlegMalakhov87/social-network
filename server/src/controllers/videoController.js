const videoService = require('../services/videoService');

const videoController = {
  /**
   * Получение публичной ленты видео и поиск
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  getVideos: async (req, res, next) => {
    try {
      const result = await videoService.getVideos({
        ...req.query,
        currentUserId: req.user?.id,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение видео пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  getUserVideos: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await videoService.getUserVideosLibrary(
        userId,
        req.user?.id,
        req.query.page,
        req.query.limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение видео по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  getVideoById: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.getVideoById(videoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание видео
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  createVideo: async (req, res, next) => {
    try {
      const result = await videoService.createVideo(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности видео
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateVideoPrivacy: async (req, res, next) => {
    try {
      const result = await videoService.updateVideoPrivacy(
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление видео
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  updateVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.updateVideo(
        videoId,
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Инкремент счетчика просмотров видео
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  incrementViewCount: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.incrementViewCount(videoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление видео (владелец)
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  deleteVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.deleteVideo(videoId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка видео файла
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  uploadVideo: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Видеофайл не предоставлен', code: 'NO_FILE' });
      res.status(200).json({ url: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка превью видео
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<Object>} - Объект с результатом
   */
  uploadThumbnail: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Файл превью не предоставлен', code: 'NO_FILE' });
      res.status(200).json({ thumbnail: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = videoController;
