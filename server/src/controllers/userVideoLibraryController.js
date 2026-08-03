const userVideoLibraryService = require('../services/userVideoLibraryService');

const userVideoLibraryController = {
  /**
   * Получить мою библиотеку
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getMyLibrary: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const result = await userVideoLibraryService.getMyLibrary(
        req.user.id,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Добавить видео в библиотеку
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  addToLibrary: async (req, res, next) => {
    try {
      const { videoId } = req.body;
      const result = await userVideoLibraryService.addToLibrary(
        req.user.id,
        videoId
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить запись в библиотеке
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateLibraryItem: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite, viewsCount, lastWatchedAt } = req.body;

      const updates = {};
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (viewsCount !== undefined) updates.viewsCount = viewsCount;
      if (lastWatchedAt !== undefined) updates.lastWatchedAt = lastWatchedAt;

      const result = await userVideoLibraryService.updateLibraryItem(
        req.user.id,
        libraryId,
        updates
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить запись из библиотеки
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  removeFromLibrary: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const result = await userVideoLibraryService.removeFromLibrary(
        req.user.id,
        libraryId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userVideoLibraryController;
