const userVideoLibraryService = require('../services/userVideoLibraryService');

const userVideoLibraryController = {
  /**
   * Получить мою библиотеку видео
   */
  getMyVideoLibrary: async (req, res, next) => {
    try {
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;
      const result = await userVideoLibraryService.getMyVideoLibrary(
        parseInt(currentUserId),
        parseInt(page),
        parseInt(limit),
        sortKey
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить библиотеку другого пользователя
   */
  getUserVideosLibrary: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;
      const result = await userVideoLibraryService.getUserVideosLibrary(
        parseInt(userId),
        parseInt(currentUserId),
        parseInt(page),
        parseInt(limit),
        sortKey
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Добавить видео в библиотеку
   */
  addToVideoLibrary: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = req.user?.id;
      const result = await userVideoLibraryService.addToVideoLibrary(
        parseInt(currentUserId),
        parseInt(videoId)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить запись в библиотеке (избранное)
   */
  updateFavoriteVideo: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite } = req.body;
      const currentUserId = req.user?.id;
      const result = await userVideoLibraryService.updateFavoriteVideo(
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
   * Увеличить счетчик просмотров видео в библиотеке
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const result = await userVideoLibraryService.incrementViewsCount(
        parseInt(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить видео из библиотеки
   */
  deleteVideoFromLibrary: async (req, res, next) => {
    try {
      const { libraryId } = req.params;
      const currentUserId = req.user?.id;
      const result = await userVideoLibraryService.deleteVideoFromLibrary(
        parseInt(currentUserId),
        parseInt(libraryId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userVideoLibraryController;
