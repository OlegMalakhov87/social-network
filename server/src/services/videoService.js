const fs = require('fs').promises;
const {
  Video,
  User,
  Like,
  Comment,
  UserVideoLibrary,
} = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};

// Поля видео, которые можно обновлять
const VIDEO_FIELDS = [
  'title',
  'description',
  'videoUrl',
  'thumbnailUrl',
  'previewUrl',
  'category',
  'isPublic',
];

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
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      previewUrl: videoData.previewUrl,
      category: videoData.category,
      isPublic: videoData.isPublic,

      uploadedBy: currentUserId,
      year: new Date().getFullYear(),
      viewsCount: 0,
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
      message: `Приватность видео успешно обновлена: ${affectedCount}`,
    };
  },

  /**
   * Обновление видео (владелец)
   * @param {number} videoId - ID видео
   * @param {number} currentUserId - ID текущего пользователя
   * @param {Object} updateData - Обновляемые данные
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideo(videoId, currentUserId, updateData) {
    const video = await Video.findByPk(videoId);
    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    if (video.uploadedBy !== currentUserId)
      throw createError(
        'Вы не можете редактировать это видео',
        403,
        'FORBIDDEN'
      );

    // Выбираем только разрешенные поля
    const dbUpdates = Object.fromEntries(
      VIDEO_FIELDS.filter((field) => Object.hasOwn(updateData, field)).map(
        (field) => [field, updateData[field]]
      )
    );

    const [, updatedRows] = await Video.update(dbUpdates, {
      where: { id: videoId },
      returning: true,
      plain: true,
    });

    const oldMedia = [video.videoUrl, video.thumbnailUrl, video.previewUrl];

    const newMedia = [
      updatedRows.videoUrl,
      updatedRows.thumbnailUrl,
      updatedRows.previewUrl,
    ];

    // Логика очистки старого видео файла
    for (const oldUrl of oldMedia) {
      if (!oldUrl || newMedia.includes(oldUrl)) {
        continue;
      }

      const filePath = fromPublicUrl(oldUrl);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа видео ${oldUrl}:`,
            error.message
          );
        }
      }
    }

    return { video: updatedRows.toJSON() };
  },

  /**
   * Инкремент счетчика просмотров видео
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementViewsCount(videoId) {
    await Video.increment('viewsCount', {
      by: 1,
      where: { id: videoId },
    });

    return { success: true };
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

    const oldMedia = [video.videoUrl, video.thumbnailUrl, video.previewUrl];

    await video.destroy();

    // Логика очистки старого медиа файла
    for (const url of oldMedia) {
      if (!url) continue;

      const filePath = fromPublicUrl(url);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить старое медиа видео ${url}:`,
            error.message
          );
        }
      }
    }
    return { message: `Видео успешно удалено: ${videoId}` };
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
        if (error.code !== 'ENOENT') throw error;
      }
    }
    return { message: 'Загруженные медиа файлы успешно удалены' };
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
      if (error.code !== 'ENOENT') throw error;
    }
    return { message: 'Загруженные медиа превью успешно удалены' };
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
      if (error.code !== 'ENOENT') throw error;
    }
    return { message: 'Загруженные медиа thumbnail успешно удалены' };
  },
};

module.exports = videoService;
