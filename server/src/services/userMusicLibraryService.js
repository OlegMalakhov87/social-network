const { Op } = require('sequelize');

const {
  UserMusicLibrary,
  Music,
  User,
  Like,
  Comment,
  Friend,
} = require('../../db/models');
const { sequelize } = require('../../db/models');
const { createError } = require('../utils/createError');

/**
 * Ограничивает сортировку известными полями и закрывает подстановку SQL.
 */
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playsCount', 'DESC']],
  viewsAsc: [['playsCount', 'ASC']],
};

const userMusicLibraryService = {
  /**
   * Возвращает библиотеку треков текущего пользователя.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getMyMusicLibrary({
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
  } = {}) {
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
   * Возвращает библиотеку треков выбранного пользователя.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.profileUserId - Идентификатор владельца профиля
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getUserMusicLibrary({
    profileUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
  } = {}) {
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
      currentUserLibraryMap = new Map(myEntries.map((e) => [e.trackId, e.id]));
    }

    const formattedTracks = libraryEntries.map((entry) => {
      const trackData = entry.track?.toJSON() || {};
      const myLibraryId = currentUserLibraryMap.get(entry.trackId);

      return {
        ...trackData,
        isInLibrary: !!myLibraryId,
        libraryId: myLibraryId,
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
    };
  },
  /**
   * Добавляет трек в библиотеку.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {number} trackId - Идентификатор трека
   * @returns {Promise<Object>} Объект с результатом.
   */
  async addToMusicLibrary(currentUserId, trackId) {
    const track = await Music.findByPk(trackId, { attributes: ['id'] });
    if (!track) {
      throw createError('Трек не найден', 404, 'TRACK_NOT_FOUND');
    }

    try {
      const [libraryItem, created] = await UserMusicLibrary.findOrCreate({
        where: { userId: currentUserId, trackId: trackId },
        defaults: { isFavorite: false, playsCount: 0 },
      });

      if (!created) {
        throw createError(
          'Трек уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }

      const itemWithMusic = await UserMusicLibrary.findByPk(libraryItem.id, {
        include: [{ model: Music, as: 'track', attributes: ['id', 'title'] }],
      });

      return { libraryItem: itemWithMusic.toJSON() };
    } catch (error) {
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
   * Обновляет признак избранного в библиотеке.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {number} libraryId - Идентификатор записи библиотеки
   * @param {boolean} isFavorite - Признак избранного
   * @returns {Promise<Object>} Объект с результатом.
   */
  async updateFavoriteTrack(currentUserId, libraryId, isFavorite) {
    const [affectedCount, updatedRows] = await UserMusicLibrary.update(
      { isFavorite },
      {
        where: { id: libraryId, userId: currentUserId },
        returning: true,
        plain: true,
      }
    );

    if (affectedCount === 0) {
      throw createError(
        'Запись в библиотеке не найдена или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    return { libraryItem: updatedRows.toJSON() };
  },

  /**
   * Увеличивает счетчик прослушиваний трека в библиотеке.
   *
   * @param {number} libraryId - Идентификатор записи библиотеки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async incrementPlaysCount(libraryId) {
    const libraryItem = await UserMusicLibrary.findByPk(libraryId);

    if (!libraryItem) {
      throw createError(
        'Запись в библиотеке не найдена',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }
    const updatedItem = await sequelize.transaction(async (transaction) => {
      await UserMusicLibrary.update(
        { playsCount: sequelize.literal('"playsCount" + 1') },
        { where: { id: libraryId }, transaction }
      );

      await Music.increment('playsCount', {
        by: 1,
        where: { id: libraryItem.trackId },
        transaction,
      });

      return UserMusicLibrary.findByPk(libraryId, {
        attributes: ['playsCount'],
        transaction,
      });
    });

    return { libraryId, playsCount: updatedItem.playsCount };
  },

  /**
   * Удаляет трек из библиотеки.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {number} libraryId - Идентификатор записи библиотеки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async deleteMusicFromLibrary(currentUserId, libraryId) {
    const deletedCount = await UserMusicLibrary.destroy({
      where: { id: libraryId, userId: currentUserId },
    });

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
