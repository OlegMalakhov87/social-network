const { Op } = require('sequelize');

const {
  sequelize,
  Music,
  User,
  Like,
  Comment,
  UserMusicLibrary,
} = require('../../db/models');
const { createError } = require('../utils/createError');
const temporaryMediaService = require('./temporaryMediaService');
const {
  deleteEntityWithRelations,
} = require('../utils/deleteEntityWithRelations');

/**
 * Ограничивает сортировку известными полями и закрывает подстановку SQL.
 */
const SORT_MAP = {
  dateDesc: { field: 'createdAt', direction: 'DESC' },
  dateAsc: { field: 'createdAt', direction: 'ASC' },
  viewsDesc: { field: 'playsCount', direction: 'DESC' },
  viewsAsc: { field: 'playsCount', direction: 'ASC' },
};

/**
 * Перечисляет поля трека, которые можно обновлять.
 */
const MUSIC_FIELDS = [
  'title',
  'artist',
  'album',
  'description',
  'audioUrl',
  'coverUrl',
  'category',
  'duration',
  'size',
  'isPublic',
];

const musicService = {
  /**
   * Возвращает публичную ленту треков и результат поиска.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {string} params.category - Категория
   * @param {string} params.q - Строка поиска
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getMusic({
    page = 1,
    limit = 30,
    category,
    q,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    const where = { isPublic: true };

    const sort = SORT_MAP[sortKey] || SORT_MAP.dateDesc;

    if (category && category !== 'all') {
      where.category = { [Op.iLike]: category };
    }

    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
        { artist: { [Op.iLike]: searchTerm } },
        { album: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
      ];
    }

    const includes = [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'avatarUrl'] },
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
    ];

    if (currentUserId) {
      includes.push({
        model: UserMusicLibrary,
        as: 'libraryItems',
        where: { userId: currentUserId },
        required: false,
        attributes: ['id'],
      });
    }

    const { count, rows: tracks } = await Music.findAndCountAll({
      where,
      include: includes,
      order: [
        [sort.field, sort.direction],
        ['id', sort.direction],
      ],
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    const formattedTracks = tracks.map((track) => {
      const trackData = track.toJSON();
      const libraryEntry = trackData.libraryItems?.[0];
      return {
        ...trackData,
        isInLibrary: !!libraryEntry,
        libraryId: libraryEntry?.id,
        playsCount: trackData?.playsCount,
        commentsCount: trackData.comments?.length,
        likesCount: trackData.likes?.length,
        isLiked: trackData.likes?.some((like) => like.userId === currentUserId),
        libraryItems: undefined,
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
   * Создает трек.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} musicData - Данные трека
   * @returns {Promise<Object>} Объект с результатом.
   */
  async createMusic(currentUserId, musicData) {
    const media = [
      {
        url: musicData.audioUrl,
        fieldName: 'audioUrl',
      },
      {
        url: musicData.coverUrl,
        fieldName: 'coverUrl',
      },
    ];

    const dbData = {
      title: musicData.title,
      artist: musicData.artist,
      album: musicData.album,
      duration: musicData.duration,
      description: musicData.description,
      audioUrl: musicData.audioUrl,
      coverUrl: musicData.coverUrl,
      category: musicData.category,
      isPublic: musicData.isPublic,
      uploadedBy: currentUserId,
      size: musicData.size,
      playsCount: 0,
    };

    return sequelize.transaction(async (transaction) => {
      await temporaryMediaService.commitMany(currentUserId, media, {
        transaction,
      });

      const track = await Music.create(dbData, { validate: true, transaction });

      const libraryItem = await UserMusicLibrary.create(
        {
          userId: currentUserId,
          trackId: track.id,
          isFavorite: true,
          playsCount: 0,
        },
        { validate: true, transaction }
      );

      return {
        track: {
          ...track.toJSON(),
          isInLibrary: true,
          libraryId: libraryItem.id,
        },
      };
    });
  },

  /**
   * Обновляет приватность треков.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} params - Параметры вызова
   * @param {boolean} params.isPublic - Признак публичности
   * @returns {Promise<Object>} Объект с результатом.
   */
  async updateMusicPrivacy(currentUserId, { isPublic }) {
    const [affectedCount] = await Music.update(
      { isPublic },
      { where: { uploadedBy: currentUserId } }
    );

    if (affectedCount === 0) {
      throw createError('Треки не найдены', 404, 'TRACKS_NOT_FOUND');
    }

    return {
      message: `Приватность треков успешно обновлена: ${affectedCount}`,
    };
  },

  /**
   * Обновляет трек владельца.
   *
   * @param {number} trackId - Идентификатор трека
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object} updates - Данные обновления
   * @returns {Promise<Object>} Объект с результатом.
   */
  async updateMusic(trackId, currentUserId, updates) {
    return sequelize.transaction(async (transaction) => {
      const track = await Music.findByPk(trackId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!track) {
        throw createError('Трек не найден', 404, 'TRACK_NOT_FOUND');
      }

      if (track.uploadedBy !== currentUserId) {
        throw createError(
          'Вы не можете редактировать этот трек',
          403,
          'FORBIDDEN'
        );
      }

      const dbUpdates = Object.fromEntries(
        MUSIC_FIELDS.filter((field) => Object.hasOwn(updates, field)).map(
          (field) => [field, updates[field]]
        )
      );

      if (Object.keys(dbUpdates).length === 0) {
        throw createError(
          'Нет данных для обновления',
          400,
          'NO_FIELDS_TO_UPDATE'
        );
      }

      const mediaFields = ['audioUrl', 'coverUrl'];

      const newTemporaryMedia = mediaFields
        .filter((fieldName) => {
          return (
            Object.hasOwn(dbUpdates, fieldName) &&
            dbUpdates[fieldName] &&
            dbUpdates[fieldName] !== track[fieldName]
          );
        })
        .map((fieldName) => ({
          url: dbUpdates[fieldName],
          fieldName,
        }));

      if (newTemporaryMedia.length > 0) {
        await temporaryMediaService.commitMany(
          currentUserId,
          newTemporaryMedia,
          { transaction }
        );
      }

      const updatedTrack = await track.update(dbUpdates, {
        validate: true,
        transaction,
      });

      return { track: updatedTrack.toJSON() };
    });
  },

  /**
   * Увеличивает счетчик прослушиваний.
   *
   * @param {number} trackId - Идентификатор трека
   * @returns {Promise<Object>} Объект с результатом.
   */
  async incrementPlaysCount(trackId) {
    await Music.increment('playsCount', {
      by: 1,
      where: { id: trackId },
    });

    return { success: true };
  },

  /**
   * Удаляет трек владельца.
   *
   * @param {number} trackId - Идентификатор трека
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @returns {Promise<Object>} Объект с результатом.
   */
  async deleteMusic(trackId, currentUserId) {
    const track = await Music.findOne({
      where: { id: trackId, uploadedBy: currentUserId },
    });

    if (!track) {
      throw createError(
        'Трек не найден или нет прав на удаление',
        404,
        'TRACK_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    const result = await deleteEntityWithRelations({
      entity: track,
      targetType: 'Music',
    });

    return {
      message: 'Трек успешно удалён',
      trackId,
      deleted: result.deleted,
    };
  },
};

module.exports = musicService;
