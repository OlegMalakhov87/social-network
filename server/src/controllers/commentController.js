const { Comment, User, Post, Music, Video, News, Like } = require('../../db/models');
const { Op } = require('sequelize');

const commentController = {
  // ==================== GET запросы ====================

  // 1. Получить все комментарии пользователя
  getAllCommentsUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows: comments } = await Comment.findAndCountAll({
        where: { userId: userId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      res.json({
        userId: userId,
        comments,
        pagination: {
          totalComments: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /comments/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получить один комментарий
  getCommentById: async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findByPk(commentId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
      });

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      res.json(comment);
    } catch (error) {
      console.error('GET /comments/:commentId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Получить все комментарии для сущности
  getAllCommentsTarget: async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const validTypes = ['Post', 'Music', 'Video', 'News'];
      if (!validTypes.includes(targetType)) {
        return res.status(400).json({ error: 'Неверный тип сущности' });
      }

      const { count, rows: comments } = await Comment.findAndCountAll({
        where: {
          targetType: targetType,
          targetId: targetId,
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
          {
            model: Like,
            as: 'likes',
            attributes: ['id', 'userId'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      if (comments.length === 0) {
        return res.status(200).json({
          comments: [],
          message: 'Комментариев пока нет',
        });
      }

      res.json({
        comments: comments.map((item) => ({
          ...item.toJSON(),
          likesCount: item.likes.length,
        })),
        pagination: {
          totalComments: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('Error in GET /comment/:targetType/:targetId', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 4. Создать комментарий
  createComment: async (req, res) => {
    try {
      const { targetType, targetId, content } = req.body;
      const userId = req.user.id; // берем из токена

      if (!userId || !targetType || !targetId || !content) {
        return res.status(400).json({
          error: 'Поля userId, targetType, targetId, content обязательны',
        });
      }

      if (content.trim().length < 1) {
        return res.status(400).json({ error: 'Комментарий не может быть пустым' });
      }

      // Проверяем пользователя
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем целевую сущность
      let targetExists = false;
      switch (targetType) {
        case 'Post':
          targetExists = await Post.findByPk(targetId);
          break;
        case 'Music':
          targetExists = await Music.findByPk(targetId);
          break;
        case 'Video':
          targetExists = await Video.findByPk(targetId);
          break;
        case 'News':
          targetExists = await News.findByPk(targetId);
          break;
        default:
          return res.status(400).json({ error: 'Неверный тип сущности' });
      }
      if (!targetExists) {
        return res.status(404).json({ error: 'Целевая сущность не найдена' });
      }

      const comment = await Comment.create({
        userId,
        targetType,
        targetId,
        content: content.trim(),
      });

      const commentWithAuthor = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Комментарий добавлен',
        comment: commentWithAuthor,
      });
    } catch (error) {
      console.error('POST /comments error:', error);

      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== PUT запросы ====================

  // 5. Обновить комментарий
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id; // берем из токена

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      if (comment.userId != userId) {
        return res.status(403).json({ error: 'Вы не можете редактировать этот комментарий' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Комментарий не может быть пустым' });
      }

      await comment.update({ content: content.trim() });

      const updatedComment = await Comment.findByPk(commentId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
      });

      res.json({
        success: true,
        message: 'Комментарий обновлен',
        comment: updatedComment,
      });
    } catch (error) {
      console.error('PUT /comments/:commentId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE ====================

  // 6. Удалить комментарий
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id; // берем из токена

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      if (comment.userId != userId) {
        return res.status(403).json({ error: 'Вы не можете удалить этот комментарий' });
      }

      await comment.destroy();

      res.json({
        success: true,
        message: 'Комментарий удален',
        commentId,
      });
    } catch (error) {
      console.error('DELETE /comments/:commentId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = commentController;
