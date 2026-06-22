const { Video, User, Like, Comment, UserVideoLibrary, Friend } = require('../../db/models');
const { Op } = require('sequelize');

const videoController = {
  // ==================== GET запросы ====================

  // 1. Поиск видео
  searchVideo: async (req, res) => {
    try {
      const { q, page = 1, limit = 30 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: 'Поисковый запрос должен содержать минимум 2 символа',
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchTerm = `%${q}%`;

      const { count, rows: videos } = await Video.findAndCountAll({
        where: {
          isPublic: true,
          [Op.or]: [
            { title: { [Op.iLike]: searchTerm } },
            { description: { [Op.iLike]: searchTerm } },
            { category: { [Op.iLike]: searchTerm } },
          ],
        },
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name'],
          },
          ...(req.user?.id
            ? [
                {
                  model: UserVideoLibrary,
                  as: 'libraryItems',
                  where: { userId: req.user.id },
                  required: false,
                  attributes: ['id'],
                },
              ]
            : []),
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      const formattedVideos = videos.map((video) => {
        const videoData = video.toJSON();
        const libraryEntry = videoData.libraryItems?.[0];
        return {
          ...videoData,
          isInLibrary: !!libraryEntry,
          libraryId: libraryEntry?.id || null,
          libraryItems: undefined,
        };
      });

      res.json({
        videos: formattedVideos,
        query: q,
        pagination: {
          totalVideos: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          hasMore: parseInt(page) * parseInt(limit) < count,
        },
      });
    } catch (error) {
      console.error('GET /videos/search error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получить все видео (публичные)
  getAllVideos: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;
      const { category, q } = req.query;
      const currentUserId = req.user?.id;

      const where = { isPublic: true };
      if (category) where.category = category;

      // Поиск по ключевому слову (если передан)
      if (q && q.trim().length > 0) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { category: { [Op.iLike]: `%${q}%` } },
        ];
      }

      const includes = [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name'],
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
          order: [['createdAt', 'ASC']],
        },
      ];

      if (currentUserId) {
        includes.push({
          model: UserVideoLibrary,
          as: 'libraryItems',
          where: { userId: currentUserId },
          required: false,
          attributes: ['id'],
        });
      }

      const { count, rows: videos } = await Video.findAndCountAll({
        where,
        include: includes,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const formattedVideos = videos.map((video) => {
        const videoData = video.toJSON();
        const libraryEntry = videoData.libraryItems?.[0];

        return {
          ...videoData,
          isInLibrary: !!libraryEntry,
          libraryId: libraryEntry?.id || null,
          libraryItems: undefined,
        };
      });

      res.json({
        videos: formattedVideos,
        pagination: {
          totalVideos: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /videos error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Видео-библиотека пользователя которого просматриваем
  getUserVideos: async (req, res) => {
    try {
      const { userId: profileUserId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;
      const currentUserId = req.user?.id;

      if (!profileUserId || profileUserId <= 0) {
        return res.status(400).json({ error: 'Неверный userId профиля' });
      }

      // Запрашиваем видео из библиотеки ПРОФИЛЯ
      const { count, rows: libraryEntries } = await UserVideoLibrary.findAndCountAll({
        where: { userId: profileUserId }, // Библиотека профиля, которого смотрим
        include: [
          {
            model: Video,
            as: 'videos',
            include: [
              { model: User, as: 'uploader', attributes: ['id', 'name'] },
              { model: Like, as: 'likes', attributes: ['id', 'userId'] },
              {
                model: Comment,
                as: 'comments',
                limit: 100,
                include: [
                  { model: User, as: 'author', attributes: ['id', 'name', 'photoUrl'] },
                  { model: Like, as: 'likes', attributes: ['id', 'userId'] },
                ],
                order: [['createdAt', 'ASC']],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      if (!libraryEntries || libraryEntries.length === 0) {
        return res.status(404).json({
          error: 'У этого пользователя нет видео в библиотеке',
          videos: [],
          pagination: { totalVideos: 0, totalPages: 0, currentPage: page, hasMore: false },
          meta: {
            profileUserId: parseInt(profileUserId),
            currentUserId: currentUserId || null,
            isOwnProfile: currentUserId === parseInt(profileUserId),
          },
        });
      }

      // Если есть текущий пользователь — получаем статус для его кнопки
      let currentUserLibraryInfo = new Map();
      if (currentUserId && currentUserId !== parseInt(profileUserId)) {
        const videoIds = libraryEntries.map((entry) => entry.videoId).filter((id) => id && id > 0);

        if (videoIds.length > 0) {
          const userLibraryEntries = await UserVideoLibrary.findAll({
            where: {
              userId: currentUserId,
              videoId: videoIds, // только видео из библиотеки профиля
            },
            attributes: ['id', 'videoId'],
            raw: true,
          });

          // Создаём карту для текущего пользователя
          currentUserLibraryInfo = new Map(
            userLibraryEntries.map((e) => [
              e.videoId,
              {
                libraryId: e.id || null,
              },
            ])
          );
        }
      }

      // Проверка статуса дружбы для отображения карточек приватного видео
      let allowedLibraryEntries = libraryEntries;

      if (currentUserId && currentUserId !== parseInt(profileUserId)) {
        // проверяем дружбу
        const friendship = await Friend.findOne({
          where: {
            [Op.or]: [
              { userId: currentUserId, friendId: profileUserId, status: 'accepted' },
              { userId: profileUserId, friendId: currentUserId, status: 'accepted' },
            ],
          },
        });
        const isFriend = !!friendship;

        // Оставляем только публичные видео, либо приватные, если пользователь друг
        allowedLibraryEntries = libraryEntries.filter((entry) => {
          const video = entry.videos;
          if (!video) return false;
          return video.isPublic || (video.isPublic === false && isFriend);
        });
      }

      //  Форматируем ответ
      const formattedVideos = allowedLibraryEntries
        .map((entry) => {
          const videoData = entry.videos?.toJSON();
          if (!videoData || !videoData.id) return null;

          // Данные из библиотеки профиля (чья страница открыта)
          const profileLibrary = {
            viewCount: entry.viewCount ?? 0,
            lastWatchedAt: entry.lastWatchedAt || null,
            libraryCreatedAt: entry.createdAt || null, // дата добавления в библиотеку профиля
            profileLibraryId: entry.id,
          };

          // Данные о моей кнопке
          const myLib = currentUserLibraryInfo.get(videoData.id);

          return {
            ...videoData,
            // Для кнопки текущего пользователя
            isInLibrary: !!myLib,
            libraryId: myLib?.libraryId || null,
            // Для отображения берём данные из библиотеки профиля
            viewCount: profileLibrary.viewCount || null,
            libraryCreatedAt: profileLibrary.libraryCreatedAt || null,
            lastWatchedAt: profileLibrary.lastWatchedAt || null,
            profileLibraryId: profileLibrary.profileLibraryId || null,
          };
        })
        .filter(Boolean);

      res.json({
        success: true,
        videos: formattedVideos,
        pagination: {
          totalVideos: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
        meta: {
          profileUserId: parseInt(profileUserId),
          currentUserId: currentUserId || null,
          isOwnProfile: currentUserId === parseInt(profileUserId),
        },
      });
    } catch (error) {
      console.error('GET /videos/profile/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Получить одно видео (нереализовано).
  getVideoById: async (req, res) => {
    try {
      const { videoId } = req.params;

      const video = await Video.findByPk(videoId, {
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name'],
          },
          {
            model: Like,
            as: 'likes',
            include: [
              {
                model: User,
                as: 'users',
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name'],
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!video) {
        return res.status(404).json({ error: 'Видео не найдено' });
      }

      await video.increment('viewCount', { by: 1 });

      res.json(video);
    } catch (error) {
      console.error('GET /videos/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 4. Загрузить видео
  createVideo: async (req, res) => {
    try {
      const { title, videoUrl, description, ...rest } = req.body;
      const uploadedBy = req.user.id;

      if (!title || !videoUrl || !description) {
        return res.status(400).json({
          error: 'Поля  title, videoUrl, description обязательны',
        });
      }

      const user = await User.findByPk(uploadedBy);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const video = await Video.create({
        ...rest,
        title: title.trim(),
        videoUrl,
        description: description.trim(),
        uploadedBy,
      });

      const videoWithUploader = await Video.findByPk(video.id, {
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name'],
          },
        ],
      });

      // Сразу добавляем в библиотеку пользователя который загрузил видео
      const libraryItem = await UserVideoLibrary.create({
        userId: uploadedBy,
        videoId: video.id,
      });

      res.status(201).json(videoWithUploader);
    } catch (error) {
      console.error('POST /videos error:', error);

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

  // 5. Обновить информацию о видео (счетчик)
  incrementViewCount: async (req, res) => {
    try {
      const { videoId } = req.params;
      await Video.increment('viewCount', { by: 1, where: { id: videoId } });
      res.json({ success: true });
    } catch (error) {
      console.error('Increment play count error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE запросы ====================

  // 6. Удалить видео
  deleteVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const uploadedBy = req.user.id;

      const video = await Video.findByPk(videoId);

      if (!video) {
        return res.status(404).json({ error: 'Видео не найдено' });
      }

      // Проверяем владельца
      if (video.uploadedBy != uploadedBy) {
        return res.status(403).json({
          error: 'Вы не можете удалить это видео',
        });
      }

      await video.destroy();

      res.json({
        success: true,
        message: 'Видео удалено',
        videoId,
      });
    } catch (error) {
      console.error('DELETE /videos/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = videoController;
