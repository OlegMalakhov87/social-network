const { Music, User, Like, Comment, UserMusicLibrary, Friend } = require('../../db/models');
const { Op } = require('sequelize');

const musicController = {
  // ==================== GET запросы ====================

  // 1. Поиск трека
  searchMusic: async (req, res) => {
    try {
      const { q, page = 1, limit = 30 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: 'Поисковый запрос должен содержать минимум 2 символа',
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchTerm = `%${q}%`;

      const { count, rows: tracks } = await Music.findAndCountAll({
        where: {
          isPublic: true,
          [Op.or]: [
            { title: { [Op.iLike]: searchTerm } },
            { artist: { [Op.iLike]: searchTerm } },
            { album: { [Op.iLike]: searchTerm } },
            { genre: { [Op.iLike]: searchTerm } },
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
                  model: UserMusicLibrary,
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

      const formattedMusic = tracks.map((track) => {
        const trackData = track.toJSON();
        const libraryEntry = trackData.libraryItems?.[0];
        return {
          ...trackData,
          isInLibrary: !!libraryEntry,
          libraryId: libraryEntry?.id || null,
          libraryItems: undefined,
        };
      });

      res.json({
        tracks: formattedMusic,
        query: q,
        pagination: {
          totalTracks: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          hasMore: parseInt(page) * parseInt(limit) < count,
        },
      });
    } catch (error) {
      console.error('GET /music/search error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получить все треки (публичные)
  getAllMusic: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;
      const { genre, q } = req.query;
      const currentUserId = req.user?.id;

      const where = { isPublic: true };
      if (genre) where.genre = genre;

      // Поиск по ключевому слову (если передан)
      if (q && q.trim().length > 0) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { artist: { [Op.iLike]: `%${q}%` } },
          { genre: { [Op.iLike]: `%${q}%` } },
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
          model: UserMusicLibrary,
          as: 'libraryItems',
          where: { userId: currentUserId },
          required: false,
          attributes: ['id', 'isFavorite', 'playCount'],
        });
      }

      const { count, rows: tracks } = await Music.findAndCountAll({
        where,
        include: includes,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const formattedTracks = tracks.map((track) => {
        const trackData = track.toJSON();
        const libraryEntry = trackData.libraryItems?.[0];
        return {
          ...trackData,
          isInLibrary: !!libraryEntry,
          libraryId: libraryEntry?.id || null,
          libraryItems: undefined,
        };
      });

      res.json({
        tracks: formattedTracks,
        pagination: {
          totalTracks: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /music error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Музыкальная библиотека пользователя которого просматриваем
  getUserMusic: async (req, res) => {
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
      const { count, rows: libraryEntries } = await UserMusicLibrary.findAndCountAll({
        where: { userId: profileUserId }, // Библиотека профиля, которого смотрим
        include: [
          {
            model: Music,
            as: 'tracks',
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
          error: 'У этого пользователя нет треков в библиотеке',
          tracks: [],
          pagination: { totalTracks: 0, totalPages: 0, currentPage: page, hasMore: false },
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
        const trackIds = libraryEntries.map((entry) => entry.trackId).filter((id) => id && id > 0);

        if (trackIds.length > 0) {
          const userLibraryEntries = await UserMusicLibrary.findAll({
            where: {
              userId: currentUserId,
              trackId: trackIds, // только треки из библиотеки профиля
            },
            attributes: ['id', 'trackId'],
            raw: true,
          });

          // Создаём карту для текущего пользователя
          currentUserLibraryInfo = new Map(
            userLibraryEntries.map((e) => [
              e.trackId,
              {
                libraryId: e.id || null,
              },
            ])
          );
        }
      }

      // Проверка статуса дружбы для отображения карточек личных треков
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

        // Оставляем только публичные треки, либо приватные, если пользователь друг
        allowedLibraryEntries = libraryEntries.filter((entry) => {
          const track = entry.tracks;
          if (!track) return false;
          return track.isPublic || (track.isPublic === false && isFriend);
        });
      }
      //  Форматируем ответ
      const formattedTracks = allowedLibraryEntries
        .map((entry) => {
          const trackData = entry.tracks?.toJSON();
          if (!trackData || !trackData.id) return null;

          // Данные из библиотеки профиля (чья страница открыта)
          const profileLibrary = {
            playCount: entry.playCount ?? 0,
            profileLibraryId: entry.id,
          };

          // Данные о моей кнопке
          const myLib = currentUserLibraryInfo.get(trackData.id);

          return {
            ...trackData,
            // Для кнопки текущего пользователя
            isInLibrary: !!myLib,
            libraryId: myLib?.libraryId || null,
            // Для отображения берём данные из библиотеки профиля
            playCount: profileLibrary.playCount || null,
            libraryCreatedAt: entry.createdAt || null,
            profileLibraryId: profileLibrary.profileLibraryId || null,
          };
        })
        .filter(Boolean);

      res.json({
        success: true,
        tracks: formattedTracks,
        pagination: {
          totalTracks: count,
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
      console.error('GET /music/profile/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Получить один трек (нереализовано).
  getMusicById: async (req, res) => {
    try {
      const { trackId } = req.params;

      const track = await Music.findByPk(trackId, {
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name'],
          },
          {
            model: Like,
            as: 'likes',
            attributes: ['id', 'userId'],
            include: [
              {
                model: User,
                as: 'user',
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

      if (!track) {
        return res.status(404).json({ error: 'Композиция не найдена' });
      }

      // Увеличиваем счетчик прослушиваний
      await track.increment('playCount', { by: 1 });

      res.json(track);
    } catch (error) {
      console.error('GET /track/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 4. Загрузить музыку
  createMusic: async (req, res) => {
    try {
      const { title, artist, fileUrl, ...rest } = req.body;
      const uploadedBy = req.user.id;

      if (!title || !artist || !fileUrl) {
        return res.status(400).json({
          error: 'Поля title, artist, fileUrl обязательны',
        });
      }

      // Проверяем существование пользователя
      const user = await User.findByPk(uploadedBy);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const track = await Music.create({
        ...rest,
        title: title.trim(),
        artist: artist.trim(),
        fileUrl,
        uploadedBy,
      });

      const trackWithUploader = await Music.findByPk(track.id, {
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name'],
          },
        ],
      });
      // Сразу добавляем в библиотеку пользователя который загрузил трек
      const libraryItem = await UserMusicLibrary.create({
        userId: uploadedBy,
        trackId: track.id,
      });

      res.status(201).json(trackWithUploader);
    } catch (error) {
      console.error('POST /track error:', error);

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

  // 5. Обновить информацию о музыке (счетчик)
  incrementPlayCount: async (req, res) => {
    try {
      const { trackId } = req.params;
      await Music.increment('playCount', { by: 1, where: { id: trackId } });
      res.json({ success: true });
    } catch (error) {
      console.error('Increment play count error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE запросы ====================

  // 5. Удалить музыку
  deleteMusic: async (req, res) => {
    try {
      const { trackId } = req.params;
      const uploadedBy = req.user.id;

      const track = await Music.findByPk(trackId);

      if (!track) {
        return res.status(404).json({ error: 'Композиция не найдена' });
      }

      // Проверяем владельца
      if (track.uploadedBy !== uploadedBy) {
        return res.status(403).json({
          error: 'Вы не можете удалить эту композицию',
        });
      }

      await track.destroy();

      res.json({
        success: true,
        message: 'Композиция удалена',
        trackId,
      });
    } catch (error) {
      console.error('DELETE /track/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};
module.exports = musicController;
