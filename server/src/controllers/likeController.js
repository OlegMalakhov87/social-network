const { Like, User, Post, Music, Video, News, Comment } = require('../../db/models');

const likeController = {
  // ==================== GET ====================

  // 1. Получить все лайки пользователя
  getAllLikesUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page - 1) * limit;

      const { count, rows: likes } = await Like.findAndCountAll({
        where: { userId: userId },
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      // Группируем по типу сущностей
      const grouped = {
        posts: likes.filter((l) => l.targetType === 'Post'),
        music: likes.filter((l) => l.targetType === 'Music'),
        videos: likes.filter((l) => l.targetType === 'Video'),
        news: likes.filter((l) => l.targetType === 'News'),
        comment: likes.filter((l) => l.targetType === 'Comment'),
      };

      res.json({
        userId: userId,
        totalLikes: count,
        likes,
        grouped,
        pagination: {
          totalLikes: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /likes/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получить все лайки для сущности
  getAllLikesTarget: async (req, res) => {
    try {
      const { targetType, targetId } = req.params;

      const validTypes = ['Post', 'Music', 'Video', 'News', 'Comment'];
      if (!validTypes.includes(targetType)) {
        return res.status(400).json({ error: 'Неверный тип сущности' });
      }

      const likes = await Like.findAll({
        where: {
          targetType: targetType,
          targetId: targetId,
        },
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        targetType,
        targetId,
        likes,
        count: likes.length,
      });
    } catch (error) {
      console.error('GET /likes/:targetType/:targetId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Проверить, поставил ли пользователь лайк
  checkLikeUser: async (req, res) => {
    try {
      const { userId, targetType, targetId } = req.query;

      if (!userId || !targetType || !targetId) {
        return res.status(400).json({
          error: 'Необходимы параметры userId, targetType, targetId',
        });
      }

      const like = await Like.findOne({
        where: {
          userId,
          targetType,
          targetId,
        },
      });

      res.json({
        hasLiked: !!like,
        like: like || null,
      });
    } catch (error) {
      console.error('GET /likes/check error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 4. Поставить лайк
  createLike: async (req, res) => {
    try {
      const { targetType, targetId } = req.body;
      const userId = req.user.id;

      if (!userId || !targetType || !targetId) {
        return res.status(400).json({
          error: 'Поля userId, targetType, targetId обязательны',
        });
      }
      // Проверяем существование пользователя
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      // Проверяем существование целевой сущности
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
        case 'Comment':
          targetExists = await Comment.findByPk(targetId);
          break;
        default:
          return res.status(400).json({ error: 'Неверный тип сущности' });
      }

      if (!targetExists) {
        return res.status(404).json({ error: 'Целевая сущность не найдена' });
      }
      // Проверяем, не ставил ли уже лайк
      const existingLike = await Like.findOne({
        where: { userId, targetType, targetId },
      });
      if (existingLike) {
        return res.status(400).json({ error: 'Лайк уже поставлен' });
      }
      const like = await Like.create({
        userId,
        targetType,
        targetId,
      });
      const likeWithUser = await Like.findByPk(like.id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name'],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Лайк поставлен',
        like: likeWithUser,
      });
    } catch (error) {
      console.error('POST /likes error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Лайк уже существует' });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE ====================

  // 5. Убрать лайк
  deleteLike: async (req, res) => {
    try {
      const { targetType, targetId } = req.body;
      const userId = req.user.id;

      if (!userId || !targetType || !targetId) {
        return res.status(400).json({
          error: 'Поля userId, targetType, targetId обязательны',
        });
      }

      const like = await Like.findOne({
        where: { userId, targetType, targetId },
      });

      if (!like) {
        return res.status(404).json({ error: 'Лайк не найден' });
      }

      await like.destroy();

      res.json({
        success: true,
        message: 'Лайк убран',
        data: { userId, targetType, targetId },
      });
    } catch (error) {
      console.error('DELETE /likes error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 6. Убрать лайк по ID (альтернативный вариант)
  deleteLikeById: async (req, res) => {
    try {
      const { likeId } = req.params;
      const userId = req.user.id;

      const like = await Like.findByPk(likeId);

      if (!like) {
        return res.status(404).json({ error: 'Лайк не найден' });
      }

      if (like.userId != userId) {
        return res.status(403).json({ error: 'Вы не можете удалить этот лайк' });
      }

      await like.destroy();

      res.json({
        success: true,
        message: 'Лайк убран',
        likeId,
      });
    } catch (error) {
      console.error('DELETE /likes/:likeId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = likeController;
