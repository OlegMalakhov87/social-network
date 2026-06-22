const { UserMusicLibrary, Music, User, Like, Comment } = require('../../db/models');

const userMusicLibraryController = {
  // 1. Получить библиотеку текущего пользователя
  getUserLibrary: async (req, res) => {
    try {
      const currentUserId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: libraryEntries } = await UserMusicLibrary.findAndCountAll({
        where: { userId: currentUserId },
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
          error: 'В Вашей библиотеке нет треков',
          tracks: [],
          pagination: { totalTracks: 0, totalPages: 0, currentPage: page, hasMore: false },
        });
      }

      const formattedTracks = libraryEntries.map((entry) => {
        const trackData = entry.tracks?.toJSON() || {};
        return {
          ...trackData,
          isInLibrary: true,
          libraryId: entry.id || null,
          isFavorite: entry.isFavorite || false,
          playCount: entry.playCount || null,
          libraryCreatedAt: entry.createdAt || null,
        };
      });

      res.json({
        success: true,
        tracks: formattedTracks,
        pagination: {
          totalTracks: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /usermusiclibrary/ error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Добавить в библиотеку
  createUserLibrary: async (req, res) => {
    try {
      const { trackId } = req.body;
      const userId = req.user?.id;

      if (!userId || !trackId) {
        return res.status(400).json({ error: 'userId и trackId обязательны' });
      }

      //Проверяем существование
      const user = await User.findByPk(userId);
      const track = await Music.findByPk(trackId);

      if (!user || !track) {
        return res.status(404).json({ error: 'Пользователь или музыка не найдены' });
      }

      // Проверяем, не добавлено ли уже
      const existing = await UserMusicLibrary.findOne({
        where: { userId, trackId },
      });

      if (existing) {
        return res.status(400).json({ error: 'Уже в библиотеке' });
      }

      const libraryItem = await UserMusicLibrary.create({
        userId,
        trackId,
      });

      const itemWithMusic = await UserMusicLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Music,
            as: 'tracks',
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Добавлено в библиотеку',
        libraryItem: itemWithMusic,
      });
    } catch (error) {
      console.error('POST /usermusiclibrary error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Удалить из библиотеки
  deleteUserLibrary: async (req, res) => {
    try {
      const { libraryId } = req.params;
      const userId = req.user.id;

      const libraryItem = await UserMusicLibrary.findByPk(libraryId);

      if (!libraryItem) {
        return res.status(404).json({ error: 'Запись в библиотеке не найдена' });
      }

      if (libraryItem.userId != userId) {
        return res.status(403).json({ error: 'Вы не можете удалить эту запись' });
      }

      await libraryItem.destroy();

      res.json({
        success: true,
        message: 'Удалено из библиотеки',
        libraryId,
      });
    } catch (error) {
      console.error('DELETE /usermusiclibrary/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Обновить (избранное, счетчик проигрываний)
  updateUserLibrary: async (req, res) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite, playCount } = req.body;
      const userId = req.user.id;

      const libraryItem = await UserMusicLibrary.findByPk(libraryId);

      if (!libraryItem) {
        return res.status(404).json({ error: 'Запись в библиотеке не найдена' });
      }

      const updates = {};
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (playCount !== undefined) {
        updates.playCount = playCount;
        await Music.increment('playCount', { by: 1, where: { id: libraryItem.trackId } }); // Увеличиваем глобальный счётчик
      }

      await libraryItem.update(updates);

      res.json({ success: true, libraryItem });
    } catch (error) {
      console.error('PUT /usermusiclibrary/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = userMusicLibraryController;
