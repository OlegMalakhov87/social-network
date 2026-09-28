const userMusicLibraryService = require('../services/userMusicLibraryService');

const userMusicLibraryController = {
  /**
   * Получить мою библиотеку треков
   */
  getMyMusicLibrary: async (req, res, next) => {
    try {
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;
      const result = await userMusicLibraryService.getMyMusicLibrary({
        currentUserId: parseInt(currentUserId),
        page: parseInt(page),
        limit: parseInt(limit),
        sortKey: sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить библиотеку выбранного пользователя
   */
  getUserMusicLibrary: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;
      const { page, limit, sortKey } = req.query;
      const result = await userMusicLibraryService.getUserMusicLibrary({
        profileUserId: parseInt(userId),
        currentUserId: parseInt(currentUserId),
        page: parseInt(page),
        limit: parseInt(limit),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Добавить трек в библиотеку
   */
  addToMusicLibrary: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = req.user?.id;
      const result = await userMusicLibraryService.addToMusicLibrary(
        parseInt(currentUserId),
        parseInt(trackId)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить запись в библиотеке (избранное)
   */
  updateFavoriteTrack: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite } = req.body;
      const currentUserId = req.user?.id;
      const result = await userMusicLibraryService.updateFavoriteTrack(
        parseInt(currentUserId),
        parseInt(libraryId),
        isFavorite
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличить счетчик прослушиваний трека в библиотеке
   */
  incrementPlaysCount: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const result = await userMusicLibraryService.incrementPlaysCount(
        parseInt(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить трек из библиотеки
   */
  deleteMusicFromLibrary: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const currentUserId = req.user?.id;
      const result = await userMusicLibraryService.deleteMusicFromLibrary(
        parseInt(currentUserId),
        parseInt(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userMusicLibraryController;
