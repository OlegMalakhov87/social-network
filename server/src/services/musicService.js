const fs = require('fs').promises;
const path = require('path');
const {
  Music,
  User,
  Like,
  Comment,
  UserMusicLibrary,
} = require('../../db/models');
const { Op } = require('sequelize');
const createError = require('../utils/createError');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['playsCount', 'DESC']],
  viewsAsc: [['playsCount', 'ASC']],
};

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
   * @param {number} userId - ID пользователя, создающего трек
   * @param {Object} musicData - Данные трека
   * @returns {Promise<Object>} - Объект с результатом
   */
  async createMusic(userId, musicData) {
    const dbData = {
      ...musicData,
      uploadedBy: userId,
      playsCount: 0,
    };

    const track = await Music.create(dbData);

    // Автоматически добавляем в библиотеку создателя
    await UserMusicLibrary.create({
      userId,
      trackId: track.id,
      isFavorite: true,
      playsCount: 0,
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
    const [affectedCount] = await Music.update(
      { isPublic: updates.isPublic },
      { where: { uploadedBy: userId } }
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

    const dbUpdates = { ...updates };

    // Логика очистки старого аудио файла
    if (updates.audioUrl !== undefined) {
      const newAudioUrl = updates.audioUrl;
      if (
        newAudioUrl !== track.audioUrl &&
        !track.audioUrl.includes('/default-track.mp3')
      ) {
        const oldFilePath = path.join(__dirname, '../../', track.audioUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старое аудио:', err.message);
        }
      }
      dbUpdates.audioUrl = newAudioUrl;
    }

    // Логика очистки старой обложки
    if (updates.coverUrl !== undefined) {
      const newCoverUrl = updates.coverUrl;
      if (
        newCoverUrl !== track.coverUrl &&
        !track.coverUrl.includes('/default-image.jpg')
      ) {
        const oldFilePath = path.join(__dirname, '../../', track.coverUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старую обложку:', err.message);
        }
      }
      dbUpdates.coverUrl = newCoverUrl;
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
   * @param {number} userId - ID пользователя, удаляющего трек
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteMusic(trackId, userId) {
    const track = await Music.findOne({
      where: { id: trackId, uploadedBy: userId },
    });
    if (!track) {
      throw createError('Композиция не найдена', 404, 'TRACK_NOT_FOUND');
    }

    // Логика очистки старого аудио файла
    if (track.audioUrl !== undefined) {
      const oldFilePath = path.join(__dirname, '../../', track.audioUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старое аудио:', err.message);
      }
    }
    // Логика очистки старой обложки
    if (track.coverUrl !== undefined) {
      const oldFilePath = path.join(__dirname, '../../', track.coverUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старую обложку:', err.message);
      }
    }
    await track.destroy();
    return { message: 'Композиция успешно удалена', trackId };
  },
};

module.exports = musicService;
