const userVideoLibraryService = require('../services/userVideoLibraryService');

const userVideoLibraryController = {
  /**
   * Возвращает библиотеку видео текущего пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getMyVideoLibrary: async (req, res, next) => {
    try {
      const { page, limit, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await userVideoLibraryService.getMyVideoLibrary({
        currentUserId,
        page: Number(page),
        limit: Number(limit),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Возвращает библиотеку выбранного пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getUserVideosLibrary: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await userVideoLibraryService.getUserVideosLibrary({
        profileUserId: Number(userId),
        currentUserId,
        page: Number(page),
        limit: Number(limit),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Добавляет видео в библиотеку.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  addToVideoLibrary: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await userVideoLibraryService.addToVideoLibrary(
        currentUserId,
        Number(videoId)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет признак избранного в библиотеке.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateFavoriteVideo: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await userVideoLibraryService.updateFavoriteVideo(
        currentUserId,
        Number(libraryId),
        isFavorite
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличивает счетчик просмотров видео в библиотеке.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const result = await userVideoLibraryService.incrementViewsCount(
        Number(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет видео из библиотеки.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteVideoFromLibrary: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await userVideoLibraryService.deleteVideoFromLibrary(
        currentUserId,
        Number(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userVideoLibraryController;
