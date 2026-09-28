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
const temporaryMediaService = require('./temporaryMediaService');

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
  'duration',
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

    // Получаем треки с автором, лайками и комментариями
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

    // Получаем треки с автором, лайками и комментариями
    const { count, rows: tracks } = await Music.findAndCountAll({
      where,
      include: includes,
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    // Форматируем треки
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
    // Определяем новые медиа файлы
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

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(currentUserId, media);

    // Формируем данные для создания трека
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
      year: new Date().getFullYear(),
      playsCount: 0,
    };

    // Создаем трек в базе данных
    const track = await Music.create(dbData);

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, media);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа трека ${track.id}:`,
        error.message
      );
    }

    // Автоматически добавляем в библиотеку создателя
    const libraryItem = await UserMusicLibrary.create({
      userId: currentUserId,
      trackId: track.id,
      isFavorite: true,
      playsCount: 0,
    });

    return {
      track: {
        ...track.toJSON(),
        isInLibrary: true,
        libraryId: libraryItem.id,
      },
    };
  },

  /**
   * Обновление приватности треков
   * @param {number} currentUserId - ID пользователя, обновляющего треки
   * @param {boolean} isPublic - Приватность треков
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateMusicPrivacy(currentUserId, { isPublic }) {
    // Обновляем приватность треков
    const [affectedCount] = await Music.update(
      { isPublic },
      { where: { uploadedBy: currentUserId } }
    );

    // Проверяем, найдены ли треки
    if (affectedCount === 0) {
      throw createError('Треки не найдены', 404, 'TRACKS_NOT_FOUND');
    }

    // Возвращаем результат
    return {
      message: `Приватность треков успешно обновлена: ${affectedCount}`,
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
    // Получаем трек
    const track = await Music.findByPk(trackId);

    // Проверяем, найден ли трек
    if (!track) {
      throw createError('Трек не найден', 404, 'TRACK_NOT_FOUND');
    }

    // Проверяем, является ли текущий пользователь автором трека
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

    // Проверяем, есть ли данные для обновления
    if (Object.keys(dbUpdates).length === 0) {
      throw createError(
        'Нет данных для обновления',
        400,
        'NO_FIELDS_TO_UPDATE'
      );
    }

    // Сравниваем новые и старые URL и получаем тольконовые URL
    const newTemporaryMedia = [
      {
        url: dbUpdates.audioUrl,
        fieldName: 'audioUrl',
      },
      {
        url: dbUpdates.coverUrl,
        fieldName: 'coverUrl',
      },
    ].filter(({ url, fieldName }) => {
      return url && url !== track[fieldName];
    });

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(
      currentUserId,
      newTemporaryMedia
    );

    // Обновляем трек в базе данных
    let updatedTrack;

    try {
      updatedTrack = await track.update(dbUpdates);
    } catch (error) {
      // Если обновление трека не удалось, то удаляем новые медиа файлы
      try {
        await temporaryMediaService.removeMany(
          currentUserId,
          newTemporaryMedia
        );
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить временные файлы для трека ${track.id}:`,
            cleanupError.message
          );
        }
      }
      throw createError('Не удалось обновить трек', 500, 'UPDATE_FAILED');
    }

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, newTemporaryMedia);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа трека ${track.id}:`,
        error.message
      );
    }

    // Возвращаем результат
    return { track: updatedTrack.toJSON() };
  },

  /**
   * Инкремент счетчика проигрываний
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementPlaysCount(trackId) {
    // Инкрементируем счетчик проигрываний
    await Music.increment('playsCount', {
      by: 1,
      where: { id: trackId },
    });

    return { success: true };
  },

  /**
   * Удаление трека (владелец)
   * @param {number} trackId - ID трека
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteMusic(trackId, currentUserId) {
    // Получаем трек
    const track = await Music.findOne({
      where: { id: trackId, uploadedBy: currentUserId },
    });

    // Проверяем, найден ли трек
    if (!track) {
      throw createError(
        'Трек не найден или нет прав на удаление',
        404,
        'TRACK_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Удаляем трек (медиа файлы автоматически удалит cleanup() из mediaCleanupService по расписанию)
    await track.destroy();

    return { message: 'Трек успешно удален', trackId };
  },
};

module.exports = musicService;
