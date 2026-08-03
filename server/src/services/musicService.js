const fs = require('fs').promises;
const path = require('path');
const {
  Music,
  User,
  Like,
  Comment,
  UserMusicLibrary,
  Friend,
} = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playCount', 'DESC']],
  viewsAsc: [['playCount', 'ASC']],
};

const musicService = {
  /**
   * Получение публичной ленты треков и поиск
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество треков на странице
   * @param {string} params.genre - Жанр трека
   * @param {string} params.q - Поисковый запрос
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {string} params.sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getMusic({
    page = 1,
    limit = 30,
    genre,
    q,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isPublic: true }; // По умолчанию показываем только публичные

    if (genre && genre !== 'all') {
      where.genre = genre;
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
      { model: User, as: 'uploader', attributes: ['id', 'name', 'avatar'] },
      { model: Like, as: 'likes', attributes: ['id', 'userId'] },
      {
        model: Comment,
        as: 'comments',
        limit: 100,
        order: [['createdAt', 'ASC']],
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
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
        attributes: ['id', 'isFavorite', 'playCount'],
      });
    }

    const { count, rows: tracks } = await Music.findAndCountAll({
      where,
      include: includes,
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const formattedTracks = tracks.map((track) => {
      const trackData = track.toJSON();
      const libraryEntry = trackData.libraryItems?.[0];
      return {
        ...trackData,
        isInLibrary: !!libraryEntry,
        libraryId: libraryEntry?.id || null,
        isFavorite: libraryEntry?.isFavorite || false,
        playsCount: libraryEntry?.playCount || 0,
        commentsCount: trackData.comments?.length || 0,
        libraryItems: undefined, // Убираем мусор из ответа
      };
    });

    return {
      tracks: formattedTracks,
      pagination: {
        totalTracks: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Получение библиотеки треков конкретного пользователя
   * @param {number} profileUserId - ID пользователя, библиотеку которого запрашивают
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество треков на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getUserMusicLibrary(
    profileUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Проверяем дружбу (нужно для фильтрации приватных треков)
    let isFriend = false;
    if (currentUserId && currentUserId !== parseInt(profileUserId)) {
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
    if (currentUserId !== parseInt(profileUserId)) {
      // Если не владелец: показываем публичные, ИЛИ приватные (только если друзья)
      trackWhere[Op.or] = [{ isPublic: true }];
      if (isFriend) {
        trackWhere[Op.or].push({ isPublic: false });
      }
    }

    // Получаем записи из библиотеки ПРОФИЛЯ
    const { count, rows: libraryEntries } =
      await UserMusicLibrary.findAndCountAll({
        where: { userId: parseInt(profileUserId) },
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

    // Создаем Map для быстрого поиска треков в библиотеке текущего пользователя
    let currentUserLibraryMap = new Map();
    if (
      currentUserId &&
      currentUserId !== parseInt(profileUserId) &&
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

    // Форматируем ответ
    const formattedTracks = libraryEntries.map((entry) => {
      const trackData = entry.track?.toJSON() || {};
      const myLibraryId = currentUserLibraryMap.get(entry.trackId);

      return {
        ...trackData,
        // Данные для кнопки текущего пользователя
        isInLibrary: !!myLibraryId,
        libraryId: myLibraryId || null,
        // Данные из библиотеки просматриваемого профиля
        libraryId: entry.id,
        playsCount: entry.playCount || 0,
        commentsCount: trackData.comments?.length || 0,
        libraryCreatedAt: entry.createdAt,
      };
    });

    return {
      tracks: formattedTracks,
      pagination: {
        totalTracks: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
      meta: {
        profileUserId: parseInt(profileUserId),
        currentUserId: currentUserId || null,
        isOwnProfile: currentUserId === parseInt(profileUserId),
        isFriend,
      },
    };
  },

  /**
   * Получение одного трека по ID
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getMusicById(trackId) {
    const track = await Music.findByPk(trackId, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'avatar'] },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!track) {
      throw createError('Композиция не найдена', 404, 'TRACK_NOT_FOUND');
    }

    return {
      track: {
        ...track.toJSON(),
        likesCount: track.likes?.length,
        commentsCount: track.comments?.length,
      },
    };
  },

  /**
   * Создание нового трека
   * @param {number} userId - ID пользователя, создающего трек
   * @param {Object} musicData - Данные трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async createMusic(userId, musicData) {
    const dbData = {
      ...musicData,
      uploadedBy: userId,
      playCount: 0,
    };

    if (
      !dbData.title ||
      !dbData.audio ||
      !dbData.artist ||
      !dbData.uploadedBy ||
      !dbData.playCount ||
      !dbData.genre ||
      !dbData.isPublic
    ) {
      throw createError(
        'Поля title, audio, artist, uploadedBy, playCount, genre, isPublic обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    const track = await Music.create(dbData);

    // Автоматически добавляем в библиотеку создателя
    await UserMusicLibrary.create({
      userId,
      trackId: track.id,
      isFavorite: true,
      playCount: 0,
    });

    return { track: track.toJSON() };
  },

  /**
   * Обновление приватности треков
   * @param {number} userId - ID пользователя, обновляющего треки
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateMusicPrivacy(userId, updates) {
    const tracks = await Music.findAll({ where: { uploadedBy: userId } });
    if (tracks.length === 0) {
      throw createError('Треки не найдены', 404, 'TRACKS_NOT_FOUND');
    }
    if (updates.isPublic !== undefined) {
      tracks.forEach((track) => {
        track.isPublic = updates.isPublic;
        return track.save();
      });
    }
    return {
      message: 'Приватность треков успешно обновлена',
      tracks: tracks.length,
    };
  },

  /**
   * Обновление метаданных трека (владелец)
   * @param {number} trackId - ID трека
   * @param {number} userId - ID пользователя, обновляющего трек
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateMusic(trackId, userId, updates) {
    const track = await Music.findByPk(trackId);
    if (!track) {
      throw createError('Композиция не найдена', 404, 'TRACK_NOT_FOUND');
    }

    if (track.uploadedBy !== userId) {
      throw createError(
        'Вы не можете редактировать эту композицию',
        403,
        'FORBIDDEN'
      );
    }

    // Маппинг полей для обновления
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.artist !== undefined) dbUpdates.artist = updates.artist.trim();
    if (updates.genre !== undefined) dbUpdates.genre = updates.genre.trim();
    if (updates.album !== undefined)
      dbUpdates.album = updates.album.trim() || null;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.description !== undefined)
      dbUpdates.description = updates.description.trim() || null;
    if (updates.isPublic !== undefined) dbUpdates.isPublic = updates.isPublic;

    // Логика очистки старого аудио файла
    if (updates.audio !== undefined) {
      const newAudio = updates.audio;
      if (
        newAudio !== track.audio &&
        track.audio &&
        !track.audio.includes('/audio-track.mp3')
      ) {
        const oldFilePath = path.join(__dirname, '../../', track.audio);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старое аудио:', err.message);
        }
      }
      dbUpdates.audio = newAudio;
    }

    // Логика очистки старой обложки
    if (updates.cover !== undefined) {
      const newCover = updates.cover;
      if (
        newCover !== track.cover &&
        track.cover &&
        !track.cover.includes('/cover-track.webp')
      ) {
        const oldFilePath = path.join(__dirname, '../../', track.cover);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старую обложку:', err.message);
        }
      }
      dbUpdates.cover = newCover;
    }

    if (Object.keys(dbUpdates).length === 0) {
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');
    }

    const [, updatedRows] = await Music.update(dbUpdates, {
      where: { id: trackId },
      returning: true,
      plain: true,
    });

    return { track: updatedRows.toJSON() };
  },

  /**
   * Инкремент счетчика прослушиваний
   * @param {number} trackId - ID трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementPlayCount(trackId) {
    const track = await Music.findByPk(trackId);
    if (!track) {
      throw createError('Композиция не найдена', 404, 'TRACK_NOT_FOUND');
    }

    await track.increment('playCount', { by: 1 });
    await track.reload();

    return { success: true, playCount: track.playCount };
  },

  /**
   * Удаление трека (владелец)
   * @param {number} trackId - ID трека
   * @param {number} userId - ID пользователя, удаляющего трек
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteMusic(trackId, userId) {
    const deletedCount = await Music.destroy({
      where: { id: trackId, uploadedBy: userId },
    });

    if (deletedCount === 0) {
      throw createError(
        'Композиция не найдена или нет прав на удаление',
        404,
        'TRACK_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    return { message: 'Композиция успешно удалена', trackId };
  },
};

module.exports = musicService;
