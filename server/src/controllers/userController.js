const fs = require('node:fs/promises');
const userService = require('../services/userService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Контроллер для работы с пользователями
 */
const userController = {
  /**
   * Получить данные о пользователе и статусе дружбы
   */
  getUserProfileWithFriendshipStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await userService.getUserProfileWithFriendshipStatus({
        currentUserId: Number(req.user?.id),
        targetUserId: Number(userId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Проверка онлайн статуса пользователей
   */
  checkOnlineBulk: async (req, res, next) => {
    try {
      const { userIds } = req.body;
      const result = await userService.checkOnlineBulk(userIds);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка аватара пользователя
   */
  uploadAvatar: async (req, res, next) => {
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
    const stagingPath = req.file?.path;

    let avatarPath = null;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
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
      avatarPath = await mediaStorageService.publish(req.file);

      const avatarUrl = toPublicUrl(avatarPath);

      await temporaryMediaService.registerMany([
        {
          userId: currentUserId,
          url: avatarUrl,
          mediaType: 'image',
          fieldName: 'avatarUrl',
        },
      ]);

      registered = true;

      return res.status(200).json({ avatarUrl });
    } catch (error) {
      if (!registered && avatarPath) {
        try {
          await fs.unlink(avatarPath);

          console.log(
            '[UserController] Удалён аватар после ошибки:',
            avatarPath
          );
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[UserController] Ошибка удаления аватара пользователя после ошибки:',
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
              '[UserController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Обновление пользователя
   */
  updateUser: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await userService.updateUser(currentUserId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности пользователя
   */
  updatePrivacy: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await userService.updatePrivacy(currentUserId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Изменение пароля пользователя
   */
  changePassword: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        currentUserId,
        currentPassword,
        newPassword
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление пользователя
   */
  deleteUser: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await userService.deleteUser(currentUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженного аватара пользователя
   */
  deleteUploadedAvatar: async (req, res, next) => {
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
          url: req.body?.avatarUrl,
          fieldName: 'avatarUrl',
        },
      ]);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
