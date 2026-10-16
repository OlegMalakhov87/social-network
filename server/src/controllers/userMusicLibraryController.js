const userMusicLibraryService = require('../services/userMusicLibraryService');

const userMusicLibraryController = {
  /**
   * Получить мою библиотеку треков
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
   * Получить библиотеку выбранного пользователя
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
   * Добавить трек в библиотеку
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
   * Обновить запись в библиотеке (избранное)
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
   * Увеличить счетчик прослушиваний трека в библиотеке
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
   * Удалить трек из библиотеки
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
