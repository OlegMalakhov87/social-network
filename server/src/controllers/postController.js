const postService = require('../services/postService');

const postController = {
  /**
   * Получение постов пользователя
   */
  getUserPosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;

      const result = await postService.getUserPosts(
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
   * Получение поста по ID
   */
  getPostById: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      const result = await postService.getPostById(
        parseInt(postId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание поста
   */
  createPost: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await postService.createPost(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка медиа файла
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
   */
  updatePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      // Проверка прав внутри сервиса, передаем userId
      const result = await postService.updatePost(
        parseInt(postId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности постов
   */
  updatePostPrivacy: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await postService.updatePostPrivacy(
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление поста
   */
  deletePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      const result = await postService.deletePost(
        parseInt(postId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
