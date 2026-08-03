const postService = require('../services/postService');

const postController = {
  /**
   * Получение постов пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getUserPosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const currentUserId = req.user.id;

      const result = await postService.getUserPosts(
        userId,
        currentUserId,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение поста по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getPostById: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const result = await postService.getPostById(postId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание поста
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  createPost: async (req, res, next) => {
    try {
      const result = await postService.createPost(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка медиа файла
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  uploadMedia: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }
      const result = await postService.uploadMedia(req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление поста
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updatePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      // Проверка прав внутри сервиса, передаем userId
      const result = await postService.updatePost(
        postId,
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление поста
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  deletePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const result = await postService.deletePost(postId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
