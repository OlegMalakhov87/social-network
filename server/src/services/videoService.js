const fs = require('fs').promises;
const path = require('path');
const {
  Video,
  User,
  Like,
  Comment,
  UserVideoLibrary,
} = require('../../db/models');
const { Op } = require('sequelize');
const createError = require('../utils/createError');
const fromPublicUrl = require('../utils/fromPublicUrl');

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
    const where = { isPublic: true }; // По умолчанию показываем только публичные
    if (category && category !== 'all') {
      where.category = { [Op.iLike]: category };
    }

    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
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
        model: UserVideoLibrary,
        as: 'libraryItems',
        where: { userId: currentUserId },
        required: false,
        attributes: ['id'],
      });
    }

    const { count, rows: videos } = await Video.findAndCountAll({
      where,
      include: includes,
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    const formattedVideos = videos.map((video) => {
      const videoData = video.toJSON();
      const libraryEntry = videoData.libraryItems?.[0];
      return {
        ...videoData,
        isInLibrary: !!libraryEntry,
        libraryId: libraryEntry?.id,
        viewsCount: videoData?.viewsCount,
        commentsCount: videoData.comments?.length,
        likesCount: videoData.likes?.length,
        isLiked: videoData.likes?.some((like) => like.userId === currentUserId),
        libraryItems: undefined, // Убираем мусор из ответа
      };
    });

    return {
      videos: formattedVideos,
      pagination: {
        totalVideos: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Создать новое видео
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} videoData - Данные видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async createVideo(currentUserId, videoData) {
    const dbData = {
      ...videoData,
      viewsCount: 0,
      year: new Date().getFullYear(),
      uploadedBy: currentUserId,
    };

    const video = await Video.create(dbData);

    // Автоматически добавляем в библиотеку создателя
    await UserVideoLibrary.create({
      userId: currentUserId,
      videoId: video.id,
      isFavorite: true,
      viewsCount: 0,
      lastWatchedAt: null,
    });

    return { video: video.toJSON() };
  },

  /**
   * Обновление приватности видео
   * @param {number} currentUserId - ID пользователя, обновляющего видео
   * @param {boolean} isPublic - Приватность видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideoPrivacy(currentUserId, { isPublic }) {
    const [affectedCount] = await Video.update(
      { isPublic },
      { where: { uploadedBy: currentUserId } }
    );

    if (affectedCount === 0) {
      throw createError('Видео не найдены', 404, 'VIDEOS_NOT_FOUND');
    }

    return {
      message: 'Приватность видео успешно обновлена',
      videos: affectedCount,
    };
  },

  /**
   * Обновление видео (владелец)
   * @param {number} videoId - ID видео
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updates - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideo(videoId, currentUserId, updates) {
    const video = await Video.findByPk(videoId);
    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    if (video.uploadedBy !== currentUserId)
      throw createError(
        'Вы не можете редактировать это видео',
        403,
        'FORBIDDEN'
      );

    const dbUpdates = { ...updates };

    // Логика очистки старого видео файла
    if (updates.videoUrl) {
      const newVideoUrl = updates.videoUrl;
      if (
        newVideoUrl !== video.videoUrl &&
        !video.videoUrl.includes('/default-video.mp4')
      ) {
        const oldFilePath = fromPublicUrl(video.videoUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старое видео:', err.message);
        }
      }
      dbUpdates.videoUrl = newVideoUrl;
    }

    // Логика очистки старой обложки
    if (updates.thumbnailUrl) {
      const newThumbnailUrl = updates.thumbnailUrl;
      if (
        newThumbnailUrl !== video.thumbnailUrl &&
        !video.thumbnailUrl.includes('/default-image.jpg')
      ) {
        const oldFilePath = fromPublicUrl(video.thumbnailUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старую обложку:', err.message);
        }
      }
      dbUpdates.thumbnailUrl = newThumbnailUrl;
    }

    // Логика очистки старой превью
    if (updates.previewUrl) {
      const newPreviewUrl = updates.previewUrl;
      if (
        newPreviewUrl !== video.previewUrl &&
        !video.previewUrl.includes('/default-preview.mp4')
      ) {
        const oldFilePath = fromPublicUrl(video.previewUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Не удалось удалить старую превью:', err.message);
        }
      }
      dbUpdates.previewUrl = newPreviewUrl;
    }

    /** Проверка на наличие данных для обновления */
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
    await Video.increment('viewsCount', {
      by: 1,
      where: { id: videoId },
    });
    const updated = await Video.findByPk(videoId, {
      attributes: ['viewsCount'],
    });

    return { success: true, viewsCount: updated.viewsCount };
  },

  /**
   * Удаление видео (владелец)
   * @param {number} videoId - ID видео
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteVideo(videoId, currentUserId) {
    const video = await Video.findOne({
      where: { id: videoId, uploadedBy: currentUserId },
    });

    if (!video) {
      throw createError(
        'Видео не найдено или нет прав на удаление',
        404,
        'VIDEO_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Логика очистки старого видео
    if (video.videoUrl) {
      const oldFilePath = fromPublicUrl(video.videoUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старое видео:', err.message);
      }
    }
    // Логика очистки старой обложки
    if (video.thumbnailUrl) {
      const oldFilePath = fromPublicUrl(video.thumbnailUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старую обложку:', err.message);
      }
    }
    // Логика очистки старого превью
    if (video.previewUrl) {
      const oldFilePath = fromPublicUrl(video.previewUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn('Не удалось удалить старое превью:', err.message);
      }
    }
    await video.destroy();
    return { message: 'Видео успешно удалено', videoId };
  },

  /**
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять видео
   * @param {string} videoUrl - URL видео файла
   * @param {string} previewUrl - URL превью файла
   * @param {string} thumbnailUrl - URL обложки файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedMedia({ videoUrl, previewUrl, thumbnailUrl }) {
    const urls = [videoUrl, previewUrl, thumbnailUrl];

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
   * Удаление загруженных медиа превью
   * @param {string} previewUrl - URL превью файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedPreview({ previewUrl }) {
    if (!previewUrl) return;

    const filePath = fromPublicUrl(previewUrl);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  },

  /**
   * Удаление загруженных медиа thumbnail
   * @param {string} thumbnailUrl - URL обложки файла
   * @returns {Promise<Object>} - Объект с результатом
   */
  async deleteUploadedThumbnail({ thumbnailUrl }) {
    if (!thumbnailUrl) return;

    const filePath = fromPublicUrl(thumbnailUrl);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  },
};

module.exports = videoService;
