const fs = require('node:fs/promises');

const userService = require('../services/userService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

const userController = {
  /**
   * Возвращает профиль пользователя и статус дружбы.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Проверяет онлайн-статус пользователей.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Загружает аватар пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadAvatar: async (req, res, next) => {
    let registered = false;

    /**
     * Сохраняет путь временного файла до любых операций.
     */
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

      /**
       * Переносит файл в MEDIA_ROOT только после успешной проверки.
       */
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
      /**
       * Удаляет исходный файл из временного каталога, если публикация не началась.
       */
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
   * Обновляет профиль пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Обновляет приватность пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Меняет пароль пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Удаляет пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Удаляет загруженный аватар.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
