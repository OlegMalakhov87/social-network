const userMusicLibraryService = require('../services/userMusicLibraryService');

const userMusicLibraryController = {
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
      const result = await userMusicLibraryService.getMyLibrary(
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
   * Добавить трек в библиотеку
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  addToLibrary: async (req, res, next) => {
    try {
      const { trackId } = req.body;
      const result = await userMusicLibraryService.addToLibrary(
        req.user.id,
        trackId
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
      const { isFavorite, playCount } = req.body;

      // Собираем только те поля, которые действительно переданы
      const updates = {};
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (playCount !== undefined) updates.playCount = playCount;

      const result = await userMusicLibraryService.updateLibraryItem(
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
      const result = await userMusicLibraryService.removeFromLibrary(
        req.user.id,
        libraryId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userMusicLibraryController;
