const fs = require('fs').promises;
const path = require('path');
const {
  Video,
  User,
  Like,
  Comment,
  UserVideoLibrary,
  Friend,
} = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('./authService');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};

const videoService = {
  /**
   * Получить все публичные видео с возможностью фильтрации по категории и поиску.
   * @param {Object} params - Параметры запроса
   * @param {number} params.page - Номер страницы
   * @param {number} params.limit - Количество видео на странице
   * @param {string} params.category - Категория видео
   * @param {string} params.q - Поисковый запрос
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {string} params.sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getVideos({
    page = 1,
    limit = 30,
    category,
    q,
    currentUserId,
    sortKey = 'dateDesc',
  } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isPublic: true }; // По умолчанию показываем только публичные

    if (category && category !== 'all') {
      where.category = category;
    }

    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
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
        model: UserVideoLibrary,
        as: 'libraryItems',
        where: { userId: currentUserId },
        required: false,
        attributes: ['id', 'isFavorite', 'viewsCount', 'lastWatchedAt'],
      });
    }

    const { count, rows: videos } = await Video.findAndCountAll({
      where,
      include: includes,
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const formattedVideos = videos.map((video) => {
      const videoData = video.toJSON();
      const libraryEntry = videoData.libraryItems?.[0];
      return {
        ...videoData,
        isInLibrary: !!libraryEntry,
        libraryId: libraryEntry?.id || null,
        isFavorite: libraryEntry?.isFavorite || false,
        viewsCount: libraryEntry?.viewsCount || 0,
        commentsCount: videoData.comments?.length || 0,
        lastWatchedAt: libraryEntry?.lastWatchedAt || null,
        libraryItems: undefined,
      };
    });

    return {
      videos: formattedVideos,
      pagination: {
        totalVideos: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Получить библиотеку видео конкретного пользователя
   * @param {number} profileUserId - ID пользователя, библиотеку которого запрашивают
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество видео на странице
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getUserVideosLibrary(
    profileUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

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

    // Формируем условие приватности для видео
    const videoWhere = {};
    if (currentUserId !== parseInt(profileUserId)) {
      videoWhere[Op.or] = [{ isPublic: true }];
      if (isFriend) videoWhere[Op.or].push({ isPublic: false });
    }

    const { count, rows: libraryEntries } =
      await UserVideoLibrary.findAndCountAll({
        where: { userId: parseInt(profileUserId) },
        include: [
          {
            model: Video,
            as: 'video',
            where: videoWhere,
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

    // Создаем Map для быстрого поиска видео в библиотеке текущего пользователя
    let currentUserLibraryMap = new Map();
    if (
      currentUserId &&
      currentUserId !== parseInt(profileUserId) &&
      libraryEntries.length > 0
    ) {
      const videoIds = libraryEntries.map((entry) => entry.videoId);
      const myEntries = await UserVideoLibrary.findAll({
        where: { userId: currentUserId, videoId: { [Op.in]: videoIds } },
        attributes: ['videoId', 'id'],
        raw: true,
      });
      currentUserLibraryMap = new Map(myEntries.map((e) => [e.videoId, e.id]));
    }

    // Форматируем ответ
    const formattedVideos = libraryEntries.map((entry) => {
      const videoData = entry.video?.toJSON() || {};
      const myLibraryId = currentUserLibraryMap.get(entry.videoId);

      return {
        ...videoData,
        // Данные для кнопки текущего пользователя
        isInLibrary: !!myLibraryId,
        libraryId: myLibraryId || null,
        // Данные из библиотеки просматриваемого профиля
        libraryId: entry.id,
        viewsCount: entry.viewsCount || 0,
        commentsCount: videoData.comments?.length || 0,
        lastWatchedAt: entry.lastWatchedAt,
        libraryCreatedAt: entry.createdAt,
      };
    });

    return {
      videos: formattedVideos,
      pagination: {
        totalVideos: count,
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
   * Получить видео по ID
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getVideoById(videoId) {
    const video = await Video.findByPk(videoId, {
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

    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    return {
      video: {
        ...video.toJSON(),
        likesCount: video.likes?.length || 0,
        commentsCount: video.comments?.length || 0,
      },
    };
  },

  /**
   * Создать новое видео
   * @param {number} userId - ID пользователя, создающего видео
   * @param {Object} videoData - Данные видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async createVideo(userId, videoData) {
    const dbData = {
      ...videoData,
      viewsCount: 0,
      uploadedBy: userId,
    };

    if (
      !dbData.title ||
      !dbData.url ||
      !dbData.uploadedBy ||
      !dbData.viewsCount ||
      !dbData.category ||
      !dbData.isPublic
    ) {
      throw createError(
        'Поля title, url, uploadedBy, viewsCount, category, isPublic обязательны',
        400,
        'MISSING_FIELDS'
      );
    }

    const video = await Video.create(dbData);

    // Автоматически добавляем в библиотеку создателя
    await UserVideoLibrary.create({
      userId,
      videoId: video.id,
      isFavorite: true,
      viewsCount: 0,
      lastWatchedAt: new Date(),
    });

    return { video: video.toJSON() };
  },

  /**
   * Обновление приватности видео
   * @param {number} userId - ID пользователя, обновляющего видео
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideoPrivacy(userId, updates) {
    const videos = await Video.findAll({ where: { uploadedBy: userId } });
    if (videos.length === 0) {
      throw createError('Видео не найдены', 404, 'VIDEOS_NOT_FOUND');
    }
    if (updates.isPublic !== undefined) {
      videos.forEach((video) => {
        video.isPublic = updates.isPublic;
        return video.save();
      });
    }
    return {
      message: 'Приватность видео успешно обновлена',
      videos: videos.length,
    };
  },

  /**
   * Обновление видео
   * @param {number} videoId - ID видео
   * @param {number} userId - ID пользователя, обновляющего видео
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideo(videoId, userId, updates) {
    const video = await Video.findByPk(videoId);
    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    if (video.uploadedBy !== userId)
      throw createError(
        'Вы не можете редактировать это видео',
        403,
        'FORBIDDEN'
      );

    // Маппинг полей для обновления
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.description !== undefined)
      dbUpdates.description = updates.description.trim() || null;
    if (updates.category !== undefined)
      dbUpdates.category = updates.category.trim();
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.isPublic !== undefined) dbUpdates.isPublic = updates.isPublic;

    // Логика очистки старого видео файла
    if (updates.url !== undefined) {
      const newUrl = updates.url;
      if (
        newUrl !== video.url &&
        video.url &&
        !video.url.includes('/default-video.mp4')
      ) {
        const oldFilePath = path.join(__dirname, '../../', video.url);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старое видео:', err.message);
        }
      }
      dbUpdates.url = newUrl;
    }
    // Логика очистки старой обложки
    if (updates.thumbnail !== undefined) {
      const newThumbnail = updates.thumbnail;
      if (
        newThumbnail !== video.thumbnail &&
        video.thumbnail &&
        !video.thumbnail.includes('/thumbnail-video.webp')
      ) {
        const oldFilePath = path.join(__dirname, '../../', video.thumbnail);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старую обложку:', err.message);
        }
      }
      dbUpdates.thumbnail = newThumbnail;
    }

    if (Object.keys(dbUpdates).length === 0)
      throw createError('Нет данных для обновления', 400, 'NO_UPDATE_DATA');

    const [, updatedRows] = await Video.update(dbUpdates, {
      where: { id: videoId },
      returning: true,
      plain: true,
    });

    return { video: updatedRows.toJSON() };
  },

  /**
   * Инкремент счетчика просмотров видео
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementViewCount(videoId) {
    const video = await Video.findByPk(videoId);
    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    await video.increment('viewsCount', { by: 1 });
    await video.reload();

    return { success: true, viewsCount: video.viewsCount };
  },

  /**
   * Удаление видео (владелец)
   * @param {number} videoId - ID видео
   * @param {number} userId - ID пользователя, удаляющего видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteVideo(videoId, userId) {
    const deletedCount = await Video.destroy({
      where: { id: videoId, uploadedBy: userId },
    });

    if (deletedCount === 0) {
      throw createError(
        'Видео не найдено или нет прав на удаление',
        404,
        'VIDEO_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    return { message: 'Видео успешно удалено', videoId };
  },
};

module.exports = videoService;
