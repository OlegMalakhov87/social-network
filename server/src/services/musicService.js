const fs = require('fs').promises;
const {
  Music,
  User,
  Like,
  Comment,
  UserMusicLibrary,
} = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playsCount', 'DESC']],
  viewsAsc: [['playsCount', 'ASC']],
};

// Поля трека, которые можно обновлять
const MUSIC_FIELDS = [
  'title',
  'artist',
  'album',
  'description',
  'audioUrl',
  'coverUrl',
  'category',
  'isPublic',
];

const musicService = {
  /**
   * Получение публичной ленты треков и поиск
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество треков на странице
   * @param {string} params.category - Категория трека
   * @param {string} params.q - Поисковый запрос
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {string} params.sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getMusic({
    page = 1,
    limit = 30,
    category,
    q,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    const where = { isPublic: true }; // По умолчанию показываем только публичные

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

    // Если есть текущий пользователь, добавляем информацию о его библиотеке
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
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
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
        libraryItems: undefined, // Убираем мусор из ответа
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
   * Создание нового трека
   * @param {number} currentUserId - ID пользователя, создающего трек
   * @param {Object} musicData - Данные трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async createMusic(currentUserId, musicData) {
    const dbData = {
      title: musicData.title,
      artist: musicData.artist,
      album: musicData.album,
      description: musicData.description,
      audioUrl: musicData.audioUrl,
      coverUrl: musicData.coverUrl,
      category: musicData.category,
      isPublic: musicData.isPublic,

      uploadedBy: currentUserId,
      year: new Date().getFullYear(),
      playsCount: 0,
    };

    const track = await Music.create(dbData);

    // Автоматически добавляем в библиотеку создателя
    await UserMusicLibrary.create({
      userId: currentUserId,
      trackId: track.id,
      isFavorite: true,
      playsCount: 0,
    });

    return { track: track.toJSON() };
  },

  /**
   * Обновление приватности треков
   * @param {number} currentUserId - ID пользователя, обновляющего треки
   * @param {boolean} isPublic - Приватность треков
   * @returns {Promise<Object>} - Объект с результатом
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
      message: 'Приватность треков успешно обновлена',
      tracks: affectedCount,
    };
  },

  /**
   * Обновление трека (владелец)
   * @param {number} trackId - ID трека
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateMusic(trackId, currentUserId, updates) {
    const track = await Music.findByPk(trackId);
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

    // Выбираем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      MUSIC_FIELDS.filter((field) => Object.hasOwn(updates, field)).map(
        (field) => [field, updates[field]]
      )
    );

    const [, updatedRows] = await Music.update(dbUpdates, {
      where: { id: trackId },
      returning: true,
      plain: true,
    });

    const oldMedia = [track.audioUrl, track.coverUrl];

    const defaultMedia = ['/default-track.mp3', '/default-image.jpg'];

    const newMedia = [updatedRows.audioUrl, updatedRows.coverUrl];

    for (const oldUrl of oldMedia) {
      if (
        !oldUrl ||
        newMedia.includes(oldUrl) ||
        defaultMedia.includes(oldUrl)
      ) {
        continue;
      }

      const filePath = fromPublicUrl(oldUrl);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа трека ${oldUrl}:`,
            error.message
          );
        }
      }
    }

    return { track: updatedRows.toJSON() };
  },

  /**
   * Инкремент счетчика проигрываний
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementPlaysCount(trackId) {
    await Music.increment('playsCount', {
      by: 1,
      where: { id: trackId },
    });
    const updated = await Music.findByPk(trackId, {
      attributes: ['playsCount'],
    });

    return { success: true, playsCount: updated.playsCount };
  },

  /**
   * Удаление трека (владелец)
   * @param {number} trackId - ID трека
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с результатом
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

    const oldMedia = [track.audioUrl, track.coverUrl];

    await track.destroy();

    // Логика очистки старого медиа файла
    for (const url of oldMedia) {
      if (!url) continue;

      const filePath = fromPublicUrl(url);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа трека ${url}:`,
            error.message
          );
        }
      }
    }

    return { message: 'Трек успешно удален', trackId };
  },

  /**
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять трек
   * @param {string} audioUrl - URL аудио файла
   * @param {string} coverUrl - URL обложки файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedMedia({ audioUrl, coverUrl }) {
    const urls = [audioUrl, coverUrl];

    for (const url of urls) {
      if (!url) continue;

      const filePath = fromPublicUrl(url);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  },

  /**
   * Удаление загруженных медиа cover
   * @param {string} coverUrl - URL обложки файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedCover({ coverUrl }) {
    if (!coverUrl) return;

    const filePath = fromPublicUrl(coverUrl);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  },
};

module.exports = musicService;
