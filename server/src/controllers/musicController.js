const fs = require('node:fs/promises');
const musicService = require('../services/musicService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Контроллер для работы с музыкой
 */
const musicController = {
  /**
   * Получение публичной ленты треков и поиск
   */
  getMusic: async (req, res, next) => {
    try {
      const { page, limit, category, q, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await musicService.getMusic({
        page: Number(page),
        limit: Number(limit),
        category,
        q,
        currentUserId,
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
      const currentUserId = Number(req.user?.id);
      const result = await musicService.createMusic(currentUserId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка аудио файла для трека
   */
  uploadAudio: async (req, res, next) => {
    let registered = false;
    let audioPath = null;

    /** Сохраняем путь временного файла до любых операций */
    const stagingPath = req.file?.path;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Аудиофайл не предоставлен', code: 'NO_FILE' });
      }

      const mediaType = req.file.mediaType;
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      if (!['audio'].includes(mediaType)) {
        throw createError(
          'Разрешены только аудио',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      const audioMetadata = await mediaService.getMetadata(
        stagingPath,
        'audio'
      );

      if (
        !Number.isFinite(audioMetadata.duration) ||
        audioMetadata.duration <= 0 ||
        audioMetadata.duration > 600
      ) {
        throw createError(
          'Длительность аудио не должна превышать 10 минут',
          400,
          'AUDIO_DURATION_EXCEEDED'
        );
      }

      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
      audioPath = await mediaStorageService.publish(req.file);

      const audioUrl = toPublicUrl(audioPath);

      const media = [
        {
          userId: currentUserId,
          url: audioUrl,
          mediaType: 'audio',
          fieldName: 'audioUrl',
        },
      ];

      await temporaryMediaService.registerMany(media);
      registered = true;

      return res.status(200).json({
        audioUrl,
        duration: Math.max(1, Math.round(audioMetadata.duration)),
        size: Math.max(1024, Math.round(audioMetadata.size)),
      });
    } catch (error) {
      if (!registered && audioPath) {
        try {
          await fs.unlink(audioPath);

          console.log(
            '[MusicController] Удалён аудиофайл после ошибки:',
            audioPath
          );
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[MusicController] Ошибка удаления аудиофайла после ошибки:',
              cleanupError
            );
          }
        }
      }
      /** Если ошибка произошла до публикации, исходный файл всё ещё находится в staging */
      if (stagingPath) {
        try {
          await fs.unlink(stagingPath);
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[MusicController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Загрузка обложки для трека
   */
  uploadCover: async (req, res, next) => {
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
    const stagingPath = req.file?.path;

    let coverPath = null;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл обложки не предоставлен', code: 'NO_FILE' });
      }

      const mediaType = req.file.mediaType;
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      if (!['image'].includes(mediaType)) {
        throw createError(
          'Разрешены только изображения',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
      coverPath = await mediaStorageService.publish(req.file);

      const coverUrl = toPublicUrl(coverPath);

      const media = [
        {
          userId: currentUserId,
          url: coverUrl,
          mediaType: 'image',
          fieldName: 'coverUrl',
        },
      ];

      await temporaryMediaService.registerMany(media);
      registered = true;

      return res.status(200).json({ coverUrl });
    } catch (error) {
      if (!registered && coverPath) {
        try {
          await fs.unlink(coverPath);

          console.log(
            '[MusicController] Удалён файл обложки после ошибки:',
            coverPath
          );
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[MusicController] Ошибка удаления обложки после ошибки:',
              cleanupError
            );
          }
        }
      }
      /** Если ошибка произошла до публикации, исходный файл всё ещё находится в staging */
      if (stagingPath) {
        try {
          await fs.unlink(stagingPath);
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[MusicController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Обновление приватности треков
   */
  updateMusicPrivacy: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await musicService.updateMusicPrivacy(
        currentUserId,
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
      const currentUserId = Number(req.user?.id);
      const result = await musicService.updateMusic(
        Number(trackId),
        currentUserId,
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
      const result = await musicService.incrementPlaysCount(Number(trackId));
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
      const currentUserId = Number(req.user?.id);
      const result = await musicService.deleteMusic(
        Number(trackId),
        currentUserId
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
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

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
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

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
