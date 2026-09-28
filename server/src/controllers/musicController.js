const musicService = require('../services/musicService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');

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
      const currentUserId = parseInt(req.user?.id);

      const audioMetadata = await mediaService.getMetadata(audioPath);

      const audioUrl = toPublicUrl(audioPath);

      await temporaryMediaService.registerMany([
        {
          userId: currentUserId,
          url: audioUrl,
          mediaType: 'audio',
          fieldName: 'audioUrl',
        },
      ]);

      res.status(200).json({
        audioUrl,
        duration: audioMetadata.duration,
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

      const currentUserId = parseInt(req.user?.id);
      const coverUrl = toPublicUrl(req.file.path);

      await temporaryMediaService.registerMany([
        {
          userId: currentUserId,
          url: coverUrl,
          mediaType: 'image',
          fieldName: 'coverUrl',
        },
      ]);

      res.status(200).json({ coverUrl });
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
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять трек
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const media = [
        {
          url: req.body?.audioUrl,
          fieldName: 'audioUrl',
        },
        {
          url: req.body?.coverUrl,
          fieldName: 'coverUrl',
        },
      ];
      // Удаляем временные медиа файлы
      const result = await temporaryMediaService.removeMany(
        currentUserId,
        media
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженных медиа cover
   */
  deleteUploadedCover: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const result = await temporaryMediaService.removeMany(currentUserId, [
        {
          url: req.body?.coverUrl,
          fieldName: 'coverUrl',
        },
      ]);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = musicController;
