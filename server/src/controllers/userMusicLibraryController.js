const userMusicLibraryService = require('../services/userMusicLibraryService');

const userMusicLibraryController = {
  /**
   * Возвращает библиотеку треков текущего пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getMyMusicLibrary: async (req, res, next) => {
    try {
      const { page, limit, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await userMusicLibraryService.getMyMusicLibrary({
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
  getUserMusicLibrary: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const currentUserId = Number(req.user?.id);
      const { page, limit, sortKey } = req.query;
      const result = await userMusicLibraryService.getUserMusicLibrary({
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
   * Добавляет трек в библиотеку.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  addToMusicLibrary: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await userMusicLibraryService.addToMusicLibrary(
        currentUserId,
        Number(trackId)
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
  updateFavoriteTrack: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await userMusicLibraryService.updateFavoriteTrack(
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
   * Увеличивает счетчик прослушиваний трека в библиотеке.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  incrementPlaysCount: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const result = await userMusicLibraryService.incrementPlaysCount(
        Number(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет трек из библиотеки.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteMusicFromLibrary: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await userMusicLibraryService.deleteMusicFromLibrary(
        currentUserId,
        Number(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userMusicLibraryController;
