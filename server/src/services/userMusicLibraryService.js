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
  viewsDesc: [['playsCount', 'DESC']],
  viewsAsc: [['playsCount', 'ASC']],
};
const userMusicLibraryService = {
  /**
   * Получить мою библиотеку
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество треков на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>}
   */
  async getMyMusicLibrary(
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    // Ищем все записи в библиотеке
    const { count, rows: libraryEntries } =
      await UserMusicLibrary.findAndCountAll({
        where: { userId: currentUserId },
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
        limit: limit,
        offset: (page - 1) * limit,
        distinct: true,
      });

    // Форматируем ответ, объединяя данные библиотеки и трека и добавляя количество комментариев и лайков
    const tracks = libraryEntries.map((entry) => {
      const trackData = entry.track?.toJSON() || {};
      return {
        ...trackData,
        isInLibrary: true,
        libraryId: entry.id ?? null,
        isFavorite: entry.isFavorite ?? false,
        playsCount: entry.playsCount ?? 0,
        libraryCreatedAt: entry.createdAt,
        commentsCount: entry.comments?.length ?? 0,
        likesCount: entry.likes?.length ?? 0,
        isLiked:
          entry.likes?.some((like) => like.userId === currentUserId) ?? false,
      };
    });

    return {
      tracks,
      pagination: {
        totalTracks: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Добавить трек в библиотеку
   * @param {number} currentUserId - ID пользователя
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>}
   */
  async addToMusicLibrary(currentUserId, trackId) {
    // Проверяем, существует ли трек
    const track = await Music.findByPk(trackId, { attributes: ['id'] });
    if (!track) {
      throw createError('Трек не найден', 404, 'TRACK_NOT_FOUND');
    }

    try {
      // Ищем или создаем запись в библиотеке
      const [libraryItem, created] = await UserMusicLibrary.findOrCreate({
        where: { userId: currentUserId, trackId: trackId },
        defaults: { isFavorite: false, playsCount: 0 },
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
        include: [{ model: Music, as: 'track', attributes: ['id', 'title'] }],
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
   * Обновить запись в библиотеке (избранное)
   * @param {number} currentUserId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @param {boolean} isFavorite - Состояние избранного
   * @returns {Promise<Object>}
   */
  async updateFavoriteTrack(currentUserId, libraryId, isFavorite) {
    // Обновляем запись в библиотеке
    const [affectedCount, updatedRows] = await UserMusicLibrary.update(
      { isFavorite },
      {
        where: { id: libraryId, userId: currentUserId },
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

    // Возвращаем обновленную запись в библиотеке
    return { libraryItem: updatedRows.toJSON() };
  },

  /**
   * Увеличить счетчик прослушиваний трека в библиотеке
   * @param {number} libraryId - ID записи в библиотеке
   * @returns {Promise<Object>}
   */
  async incrementPlaysCount(libraryId) {
    // Находим запись в библиотеке
    const libraryItem = await UserMusicLibrary.findByPk(libraryId);
    if (!libraryItem) {
      throw createError(
        'Запись в библиотеке не найдена',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }
    // Увеличиваем счетчик прослушиваний трека в библиотеке
    await libraryItem.increment('playsCount', { by: 1 });
    await libraryItem.reload();

    // Попутно увеличиваем глобальный счетчик прослушиваний трека в таблице Music
    await Music.increment('playsCount', {
      by: 1,
      where: { id: libraryItem.trackId },
    });

    return { libraryId, playsCount: libraryItem.playsCount };
  },

  /**
   * Удалить трек из библиотеки
   * @param {number} currentUserId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @returns {Promise<Object>}
   */
  async deleteMusicFromLibrary(currentUserId, libraryId) {
    // Удаляем трек из библиотеки
    const deletedCount = await UserMusicLibrary.destroy({
      where: { id: libraryId, userId: currentUserId },
    });

    // Если трек не удален, выбрасываем ошибку
    if (deletedCount === 0) {
      throw createError(
        'Трек в библиотеке не найден или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    return { message: 'Трек удален из библиотеки', libraryId };
  },
};

module.exports = userMusicLibraryService;
