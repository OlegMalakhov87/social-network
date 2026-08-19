const musicService = require('../services/musicService');

const musicController = {
  /**
   * Получение публичной ленты треков и поиск
   */
  getMusic: async (req, res, next) => {
    try {
      const result = await musicService.getMusic({
        ...req.query,
        currentUserId: parseInt(req.user?.id),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение библиотеки треков конкретного пользователя
   */
  getUserMusic: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;
      const { page, limit, sortKey } = req.query;
      const result = await musicService.getUserMusicLibrary(
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
   * Получение одного трека по ID
   */
  getMusicById: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.getMusicById(parseInt(trackId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание нового трека
   */
  createMusic: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await musicService.createMusic(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка аудио файла для трека
   */
  uploadAudio: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Аудиофайл не предоставлен', code: 'NO_FILE' });
      }
      res.status(200).json({ audio: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка обложки для трека
   */
  uploadCover: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл обложки не предоставлен', code: 'NO_FILE' });
      }
      res.status(200).json({ cover: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности треков
   */
  updateMusicPrivacy: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await musicService.updateMusicPrivacy(
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление метаданных трека (владелец)
   */
  updateMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = req.user?.id;
      const result = await musicService.updateMusic(
        parseInt(trackId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Инкремент счетчика прослушиваний
   */
  incrementPlaysCount: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.incrementPlaysCount(parseInt(trackId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление трека (владелец)
   */
  deleteMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = req.user?.id;
      const result = await musicService.deleteMusic(
        parseInt(trackId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = musicController;
