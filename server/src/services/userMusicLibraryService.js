const {
  UserMusicLibrary,
  Music,
  User,
  Like,
  Comment,
  Friend,
} = require('../../db/models');
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');
const createError = require('../utils/createError');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playsCount', 'DESC']],
  viewsAsc: [['playsCount', 'ASC']],
};
const userMusicLibraryService = {
  /**
   * Получить мою библиотеку треков
   * @param {number} currentUserId - ID пользователя
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
        attributes: [
          'id',
          'userId',
          'trackId',
          'isFavorite',
          'playsCount',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Music,
            as: 'track',
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['id', 'name', 'avatarUrl'],
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
                    attributes: ['id', 'name', 'avatarUrl'],
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
        libraryId: entry.id,
        isFavorite: entry.isFavorite,
        playsCount: entry.playsCount,
        libraryCreatedAt: entry.createdAt,
        commentsCount: trackData.comments?.length,
        likesCount: trackData.likes?.length,
        isLiked: trackData.likes?.some((like) => like.userId === currentUserId),
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
   * Получить библиотеку треков конкретного пользователя
   * @param {number} profileUserId - ID пользователя, библиотеку которого запрашивают
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество треков на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>}
   */
  async getUserMusicLibrary(
    profileUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    let isFriend = false;
    if (currentUserId && currentUserId !== profileUserId) {
      const friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            {
              userId: currentUserId,
              friendId: profileUserId,
              status: 'accepted',
            },
            {
              userId: profileUserId,
              friendId: currentUserId,
              status: 'accepted',
            },
          ],
        },
      });
      isFriend = !!friendship;
    }

    // Формируем условие приватности для треков
    const trackWhere = {};
    if (currentUserId !== profileUserId) {
      trackWhere[Op.or] = [{ isPublic: true }];
      if (isFriend) trackWhere[Op.or].push({ isPublic: false });
    }

    const { count, rows: libraryEntries } =
      await UserMusicLibrary.findAndCountAll({
        where: { userId: profileUserId },
        attributes: [
          'id',
          'userId',
          'trackId',
          'isFavorite',
          'playsCount',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Music,
            as: 'track',
            where: trackWhere,
            required: true,
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['id', 'name', 'avatarUrl'],
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
                    attributes: ['id', 'name', 'avatarUrl'],
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

    // Создаем Map для быстрого поиска треков в библиотеке текущего пользователя
    let currentUserLibraryMap = new Map();
    if (
      currentUserId &&
      currentUserId !== profileUserId &&
      libraryEntries.length > 0
    ) {
      const trackIds = libraryEntries.map((entry) => entry.trackId);
      const myEntries = await UserMusicLibrary.findAll({
        where: { userId: currentUserId, trackId: { [Op.in]: trackIds } },
        attributes: ['trackId', 'id'],
        raw: true,
      });
      myEntries.forEach((entry) => {
        currentUserLibraryMap.set(entry.trackId, entry.id);
      });
    }

    // Форматируем ответ
    const formattedTracks = libraryEntries.map((entry) => {
      const trackData = entry.track?.toJSON() || {};
      const myLibraryId = currentUserLibraryMap.get(entry.trackId);

      return {
        ...trackData,
        // Данные для кнопки текущего пользователя
        isInLibrary: !!myLibraryId,
        libraryId: myLibraryId,
        // Данные из библиотеки просматриваемого профиля
        profileLibraryId: entry.id,
        playsCount: entry.playsCount,
        commentsCount: trackData.comments?.length,
        likesCount: trackData.likes?.length,
        isLiked: trackData.likes?.some((like) => like.userId === currentUserId),
        libraryCreatedAt: entry.createdAt,
      };
    });

    return {
      tracks: formattedTracks,
      pagination: {
        totalTracks: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
      meta: {
        profileUserId: profileUserId,
        currentUserId: currentUserId || null,
        isOwnProfile: currentUserId === profileUserId,
        isFriend,
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

    // Ищем или создаем запись в библиотеке
    try {
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

    const result = await sequelize.transaction(async (transaction) => {
      // Увеличиваем счетчик в библиотеке
      await UserMusicLibrary.update(
        { playsCount: sequelize.literal('"playsCount" + 1') },
        { where: { id: libraryId }, transaction }
      );
    });

    // Попутно увеличиваем глобальный счетчик прослушиваний трека
    await Music.increment('playsCount', {
      by: 1,
      where: { id: libraryItem.trackId },
      transaction,
    });

    // Получаем обновленные значения
    const updatedItem = await UserMusicLibrary.findOne({
      where: { id: libraryId },
      attributes: ['playsCount'],
      transaction,
    });

    return { libraryId, playsCount: updatedItem.playsCount };
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
