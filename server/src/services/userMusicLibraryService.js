const {
  UserMusicLibrary,
  Music,
  User,
  Like,
  Comment,
} = require('../../db/models');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playCount', 'DESC']],
  viewsAsc: [['playCount', 'ASC']],
};
const userMusicLibraryService = {
  /**
   * Получить мою библиотеку
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество треков на странице
   * @returns {Promise<Object>}
   */
  async getMyLibrary(userId, page = 1, limit = 30, sortKey = 'dateDesc') {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Ищем все записи в библиотеке
    const { count, rows: libraryEntries } =
      await UserMusicLibrary.findAndCountAll({
        where: { userId: parseInt(userId) },
        include: [
          {
            model: Music,
            as: 'track',
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

    // Форматируем ответ, объединяя данные библиотеки и трека и добавляя количество комментариев и лайков
    const tracks = libraryEntries.map((entry) => {
      const trackData = entry.track?.toJSON() || {};
      return {
        ...trackData,
        isInLibrary: true,
        libraryId: entry.id,
        isFavorite: entry.isFavorite,
        playCount: entry.playCount,
        libraryCreatedAt: entry.createdAt,
        commentsCount: entry.comments?.length,
        likesCount: entry.likes?.length,
      };
    });

    return {
      tracks,
      pagination: {
        totalTracks: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Добавить трек в библиотеку
   * @param {number} userId - ID пользователя
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>}
   */
  async addToLibrary(userId, trackId) {
    // Проверяем, существует ли трек
    const track = await Music.findByPk(trackId, { attributes: ['id'] });
    if (!track) {
      throw createError('Трек не найден', 404, 'TRACK_NOT_FOUND');
    }

    try {
      // Ищем или создаем запись в библиотеке
      const [libraryItem, created] = await UserMusicLibrary.findOrCreate({
        where: { userId: parseInt(userId), trackId: parseInt(trackId) },
        defaults: { isFavorite: false, playCount: 0 },
      });

      // Если запись не создана, выбрасываем ошибку
      if (!created) {
        throw createError(
          'Трек уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }

      // Ищем запись в библиотеке с треком
      const itemWithMusic = await UserMusicLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Music,
            as: 'track',
            attributes: ['id', 'title', 'artist', 'audio', 'cover'],
          },
        ],
      });

      // Возвращаем запись в библиотеке с треком
      return { libraryItem: itemWithMusic.toJSON() };
    } catch (error) {
      // Если ошибка связана с уникальным ограничением, выбрасываем ошибку
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError(
          'Трек уже находится в библиотеке',
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
    // Обновляем запись в библиотеке
    const [affectedCount, updatedRows] = await UserMusicLibrary.update(
      updates,
      {
        where: { id: parseInt(libraryId), userId: parseInt(userId) },
        returning: true,
        plain: true,
        include: [{ model: Music, as: 'track', attributes: ['id', 'title'] }],
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

    // Если обновляется счетчик прослушиваний, увеличиваем и глобальный счетчик трека
    if (updates.playCount !== undefined) {
      // Увеличиваем счетчик прослушиваний трека
      await Music.increment('playCount', {
        by: 1,
        where: { id: updatedRows.trackId },
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
    const deletedCount = await UserMusicLibrary.destroy({
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

    return { message: 'Трек удален из библиотеки', libraryId };
  },
};

module.exports = userMusicLibraryService;
