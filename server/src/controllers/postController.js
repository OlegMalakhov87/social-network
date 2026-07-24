const { Post, User, Friend, Like, Comment } = require('../../db/models');
const { Op } = require('sequelize');

const postController = {
  // ==================== GET запросы ====================

  // 1. Найти пост
  searchPosts: async (req, res) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Минимум 2 символа' });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: posts } = await Post.findAndCountAll({
        where: {
          [Op.and]: [
            { visibility: 'public' },
            {
              [Op.or]: [
                { message: { [Op.iLike]: `%${q}%` } },
                { '$author.name$': { [Op.iLike]: `%${q}%` } },
                { '$author.nickname$': { [Op.iLike]: `%${q}%` } },
              ],
            },
          ],
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      res.json({
        posts,
        query: q,
        pagination: {
          totalPosts: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          hasMore: parseInt(page) * parseInt(limit) < count,
        },
      });
    } catch (error) {
      console.error('GET /posts/search error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Лента постов (для главной страницы)
  getFeed: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: posts } = await Post.findAndCountAll({
        where: { visibility: 'public' },
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

      res.json({
        posts,
        pagination: {
          totalPosts: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('Error in GET /posts/feed:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Получить все посты пользователя (с пагинацией)
  getUserPosts: async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      // Проверяем существование пользователя
      const targetUser = await User.findByPk(targetUserId, {
        attributes: ['id', 'name'],
      });
      if (!targetUser) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Определяем статус дружбы (если это не сам владелец)
      let isOwner = currentUserId === targetUserId;
      let isFriend = false;

      if (!isOwner) {
        const friendship = await Friend.findOne({
          where: {
            [Op.or]: [
              { userId: currentUserId, friendId: targetUserId },
              { userId: targetUserId, friendId: currentUserId },
            ],
            status: 'accepted',
          },
        });
        isFriend = !!friendship;
      }

      // Базовое условие: посты принадлежат целевому пользователю
      const where = { userId: targetUserId };

      // Добавляем фильтр видимости для НЕ-владельцев
      if (!isOwner) {
        where.visibility = {
          [Op.in]: isFriend ? ['public', 'friends'] : ['public'],
        };
      }

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
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
          {
            model: Comment,
            as: 'comments',
            limit: 100,
            order: [['createdAt', 'DESC']],
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
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      if (posts.length === 0) {
        return res.status(200).json({
          posts: [],
          message: 'У пользователя пока нет постов',
        });
      }

      res.json({
        posts: posts.map((item) => ({
          ...item.toJSON(),
          likesCount: item.likes.length,
          commentsCount: item.comments.length,
        })),
        pagination: {
          totalPosts: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('Error in GET /posts/:userId', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Получить ОДИН пост по его ID со всей информацией
  getPostById: async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findByPk(postId, {
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
          {
            model: Comment,
            as: 'comments',
            attributes: ['id', 'userId'],
          },
        ],
      });

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error in GET /posts/:postId:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 5. Создать пост
  createPost: async (req, res) => {
    try {
      const { message, visibility, postType, mediaUrl } = req.body;
      const userId = req.user.id; // берем из токена

      // Валидация
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Текст поста не может быть пустым',
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: 'Не указан автор поста',
        });
      }

      // Проверяем существование пользователя
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const post = await Post.create({
        message: message.trim(),
        userId,
        visibility,
        postType,
        mediaUrl: mediaUrl || null,
      });

      // Возвращаем пост с информацией об авторе
      const postWithAuthor = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
      });

      res.status(201).json(postWithAuthor);
    } catch (error) {
      console.error('Error in POST /post/', error);

      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'Пользователь не существует' });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== PUT запросы ====================

  // 6. Обновить пост
  updatePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const { message, visibility, postType, mediaUrl } = req.body;
      const userId = req.user.id; // берем из токена

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      // Проверка владельца (временно из тела запроса)
      if (post.userId !== parseInt(userId)) {
        return res.status(403).json({
          error: 'Вы не можете редактировать этот пост',
        });
      }

      // Подготавливаем обновления
      const updates = {};
      if (message !== undefined) {
        if (message.trim().length === 0) {
          return res
            .status(400)
            .json({ error: 'Текст поста не может быть пустым' });
        }
        updates.message = message.trim();
      }
      if (visibility !== undefined) {
        updates.visibility = visibility;
      }
      if (postType !== undefined) updates.postType = postType;
      if (mediaUrl !== undefined) updates.mediaUrl = mediaUrl;

      // Если нечего обновлять
      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .json({ error: 'Не указаны поля для обновления' });
      }

      await post.update(updates);

      // Возвращаем обновленный пост
      const updatedPost = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
      });

      res.json(updatedPost);
    } catch (error) {
      console.error('Error in PUT /posts/:postId:', error);

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

  // ==================== DELETE запросы ====================

  // 7. Удалить пост
  deletePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id; // берем из токена

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      // Проверка владельца
      if (post.userId !== parseInt(userId)) {
        return res.status(403).json({
          error: 'Вы не можете удалить этот пост',
        });
      }

      await post.destroy();

      res.json({
        message: 'Пост успешно удален',
        postId: postId,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in DELETE /posts/:postId:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};
module.exports = postController;
