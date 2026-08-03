const {
  UserVideoLibrary,
  Video,
  User,
  Like,
  Comment,
} = require('../../db/models');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};
const userVideoLibraryService = {
  /**
   * Получить мою библиотеку
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество видео на странице
   * @returns {Promise<Object>}
   */
  async getMyLibrary(userId, page = 1, limit = 30, sortKey = 'dateDesc') {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Ищем все записи в библиотеке
    const { count, rows: libraryEntries } =
      await UserVideoLibrary.findAndCountAll({
        where: { userId: parseInt(userId) },
        include: [
          {
            model: Video,
            as: 'video',
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['id', 'name', 'avatar'],
              },
              { model: Like, as: 'likes', attributes: ['id', 'userId'] },
              {
                model: Comment,
                as: 'comments',
                limit: 100,
                order: [['createdAt', 'ASC']],
                include: [
                  {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar'],
                  },
                  { model: Like, as: 'likes', attributes: ['id', 'userId'] },
                ],
              },
            ],
          },
        ],
        order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

    // Форматируем ответ, объединяя данные библиотеки и видео и добавляя количество комментариев и лайков
    const videos = libraryEntries.map((entry) => {
      const videoData = entry.video?.toJSON() || {};
      return {
        ...videoData,
        isInLibrary: true,
        libraryId: entry.id,
        isFavorite: entry.isFavorite,
        viewsCount: entry.viewsCount,
        lastWatchedAt: entry.lastWatchedAt,
        libraryCreatedAt: entry.createdAt,
        commentsCount: entry.comments?.length,
        likesCount: entry.likes?.length,
      };
    });

    return {
      videos,
      pagination: {
        totalVideos: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Добавить видео в библиотеку
   * @param {number} userId - ID пользователя
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>}
   */
  async addToLibrary(userId, videoId) {
    // Проверяем, существует ли видео
    const video = await Video.findByPk(videoId, { attributes: ['id'] });
    if (!video) {
      throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');
    }

    // Ищем или создаем запись в библиотеке
    try {
      const [libraryItem, created] = await UserVideoLibrary.findOrCreate({
        where: { userId: parseInt(userId), videoId: parseInt(videoId) },
        defaults: {
          isFavorite: false,
          viewsCount: 0,
          lastWatchedAt: new Date().toISOString(),
        },
      });

      // Если запись не создана, выбрасываем ошибку
      if (!created) {
        throw createError(
          'Видео уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }

      // Ищем запись в библиотеке с видео
      const itemWithVideo = await UserVideoLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'title', 'thumbnail', 'url'],
          },
        ],
      });

      // Возвращаем запись в библиотеке с видео
      return { libraryItem: itemWithVideo.toJSON() };
    } catch (error) {
      // Если ошибка связана с уникальным ограничением, выбрасываем ошибку
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError(
          'Видео уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }
      throw error;
    }
  },

  /**
   * Обновить запись в библиотеке
   * @param {number} userId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>}
   */
  async updateLibraryItem(userId, libraryId, updates) {
    const dbUpdates = {};
    if (updates.isFavorite !== undefined)
      dbUpdates.isFavorite = updates.isFavorite;
    if (updates.lastWatchedAt !== undefined)
      dbUpdates.lastWatchedAt = updates.lastWatchedAt;
    if (updates.viewsCount !== undefined) {
      dbUpdates.viewsCount = updates.viewsCount;
    }

    const [affectedCount, updatedRows] = await UserVideoLibrary.update(
      dbUpdates,
      {
        where: { id: parseInt(libraryId), userId: parseInt(userId) },
        returning: true,
        plain: true,
        include: [
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'title', 'thumbnail', 'viewsCount'],
          },
        ],
      }
    );

    // Если запись не обновлена, выбрасываем ошибку
    if (affectedCount === 0) {
      throw createError(
        'Запись в библиотеке не найдена или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    // Если фронтенд сообщает о новом просмотре, увеличиваем глобальный счетчик просмотров видео
    if (updates.viewsCount !== undefined) {
      await Video.increment('viewsCount', {
        by: 1,
        where: { id: updatedRows.videoId },
      });
    }

    // Возвращаем обновленную запись в библиотеке
    return { libraryItem: updatedRows.toJSON() };
  },

  /**
   * Удалить запись из библиотеки
   * @param {number} userId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @returns {Promise<Object>}
   */
  async removeFromLibrary(userId, libraryId) {
    // Удаляем запись из библиотеки
    const deletedCount = await UserVideoLibrary.destroy({
      where: { id: parseInt(libraryId), userId: parseInt(userId) },
    });

    // Если запись не удалена, выбрасываем ошибку
    if (deletedCount === 0) {
      throw createError(
        'Запись в библиотеке не найдена или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    // Возвращаем сообщение о удалении
    return { message: 'Видео удалено из библиотеки', libraryId };
  },
};

module.exports = userVideoLibraryService;
