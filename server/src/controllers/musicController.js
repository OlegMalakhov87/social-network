const musicService = require('../services/musicService');
const mediaService = require('../services/mediaService');

const musicController = {
  /**
   * Получение публичной ленты треков и поиск
   */
  getMusic: async (req, res, next) => {
    try {
      const { page, limit, category, q, sortKey } = req.query;
      const currentUserId = req.user?.id;
      const result = await musicService.getMusic({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        q,
        currentUserId: parseInt(currentUserId),
        sortKey,
      });
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
   * Обновление трека
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

      const audioPath = req.file.path;

      const audioMetadata = await mediaService.getMetadata(audioPath);
      res.status(200).json({
        audioUrl: `/${audioPath}`,
        duration: audioMetadata.duration,
        size: audioMetadata.size,
      });
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
      res.status(200).json({ coverUrl: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = musicController;
