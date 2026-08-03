const musicService = require('../services/musicService');

const musicController = {
  /**
   * Получение публичной ленты треков и поиск
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getMusic: async (req, res, next) => {
    try {
      // Объединили поиск и общую выдачу
      const result = await musicService.getMusic({
        ...req.query,
        currentUserId: req.user?.id,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение библиотеки треков конкретного пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getUserMusic: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await musicService.getUserMusicLibrary(
        userId,
        req.user?.id,
        req.query.page,
        req.query.limit
      );
      res.status(200).json(result); // Всегда 200, даже если tracks: []
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение одного трека по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getMusicById: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.getMusicById(trackId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание нового трека
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  createMusic: async (req, res, next) => {
    try {
      const result = await musicService.createMusic(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка аудио файла для трека
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
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
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
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
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateMusicPrivacy: async (req, res, next) => {
    try {
      const result = await musicService.updateMusicPrivacy(
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление метаданных трека (владелец)
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.updateMusic(
        trackId,
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Инкремент счетчика прослушиваний
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  incrementPlayCount: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.incrementPlayCount(trackId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление трека (владелец)
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  deleteMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.deleteMusic(trackId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = musicController;
