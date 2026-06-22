const { UserVideoLibrary, Video, User, Like, Comment } = require('../../db/models');

const userVideoLibraryController = {
  // 1. Получить библиотеку текущего пользователя
  getUserLibrary: async (req, res) => {
    try {
      const currentUserId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: libraryEntries } = await UserVideoLibrary.findAndCountAll({
        where: { userId: currentUserId },
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
          error: 'В Вашей библиотеке нет видео',
          videos: [],
          pagination: { totalVideos: 0, totalPages: 0, currentPage: page, hasMore: false },
        });
      }

      const formattedVideos = libraryEntries.map((entry) => {
        const videoData = entry.videos?.toJSON() || {};
        return {
          ...videoData,
          isInLibrary: true,
          libraryId: entry.id || null,
          isFavorite: entry.isFavorite || false,
          viewCount: entry.viewCount || null,
          lastWatchedAt: entry.lastWatchedAt || null,
          libraryCreatedAt: entry.createdAt || null,
        };
      });

      res.json({
        success: true,
        videos: formattedVideos,
        pagination: {
          totalVideos: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /uservideolibrary/ error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Добавить в библиотеку
  createUserLibrary: async (req, res) => {
    try {
      const { videoId } = req.body;
      const userId = req.user?.id;

      if (!userId || !videoId) {
        return res.status(400).json({ error: 'userId и videoId обязательны' });
      }

      //Проверяем существование
      const user = await User.findByPk(userId);
      const video = await Video.findByPk(videoId);

      if (!user || !video) {
        return res.status(404).json({ error: 'Пользователь или видео не найдены' });
      }

      // Проверяем, не добавлено ли уже
      const existing = await UserVideoLibrary.findOne({
        where: { userId, videoId },
      });

      if (existing) {
        return res.status(400).json({ error: 'Уже в библиотеке' });
      }

      const libraryItem = await UserVideoLibrary.create({
        userId,
        videoId,
      });

      const itemWithVideo = await UserVideoLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Video,
            as: 'videos',
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Добавлено в библиотеку',
        libraryItem: itemWithVideo,
      });
    } catch (error) {
      console.error('POST /uservideolibrary error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Удалить из библиотеки
  deleteUserLibrary: async (req, res) => {
    try {
      const { libraryId } = req.params;
      const userId = req.user.id;

      const libraryItem = await UserVideoLibrary.findByPk(libraryId);

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
      console.error('DELETE /uservideolibrary/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Обновить (избранное, счетчик проигрываний)
  updateUserLibrary: async (req, res) => {
    try {
      const { libraryId } = req.params;
      const { isFavorite, viewCount, lastWatchedAt } = req.body;
      const userId = req.user.id;

      const libraryItem = await UserVideoLibrary.findByPk(libraryId);

      if (!libraryItem) {
        return res.status(404).json({ error: 'Запись в библиотеке не найдена' });
      }

      const updates = {};
      if (isFavorite !== undefined) updates.isFavorite = isFavorite;
      if (lastWatchedAt !== undefined) updates.lastWatchedAt = lastWatchedAt;
      if (viewCount !== undefined) {
        updates.viewCount = viewCount;
        await Video.increment('viewCount', { by: 1, where: { id: libraryItem.videoId } }); // Увеличиваем глобальный счётчик
      }

      await libraryItem.update(updates);

      res.json({
        success: true,
        libraryItem,
      });
    } catch (error) {
      console.error('PUT /uservideolibrary/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 5. Отметить просмотр видео (увеличить счетчик и обновить lastWwatchedAat) альтернативный вариант (нереализовано)
  updateСounters: async (req, res) => {
    try {
      const { libraryId } = req.params;

      const libraryItem = await UserVideoLibrary.findByPk(libraryId, {
        include: [
          {
            model: Video,
            as: 'videos',
          },
        ],
      });

      if (!libraryItem) {
        return res.status(404).json({ error: 'Запись в библиотеке не найдена' });
      }

      // Обновляем в библиотеке
      await libraryItem.update({
        watchCount: libraryItem.watchCount + 1,
        lastWatchedAt: new Date(),
      });

      // Обновляем общий счетчик просмотров видео
      await Video.increment('viewCount', {
        by: 1,
        where: { id: libraryItem.videoId },
      });

      // Возвращаем обновленную запись
      const updatedItem = await UserVideoLibrary.findByPk(libraryId, {
        include: [
          {
            model: Video,
            as: 'videos',
            attributes: ['id', 'title', 'thumbnailUrl', 'viewCount'],
          },
        ],
      });

      res.json({
        success: true,
        message: 'Просмотр засчитан',
        libraryItem: updatedItem,
      });
    } catch (error) {
      console.error('PUT /uservideolibrary/:id/watch error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = userVideoLibraryController;
