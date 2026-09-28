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
const temporaryMediaService = require('./temporaryMediaService');

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
  'duration',
  'size',
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

    // Получаем видео с автором, лайками и комментариями
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

    // Получаем видео с автором, лайками и комментариями
    const { count, rows: videos } = await Video.findAndCountAll({
      where,
      include: includes,
      order: SORT_MAP[sortKey] || SORT_MAP.dateDesc,
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    // Форматируем видео
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
    // Определяем новые медиа файлы
    const media = [
      {
        url: videoData.videoUrl,
        fieldName: 'videoUrl',
      },
      {
        url: videoData.previewUrl,
        fieldName: 'previewUrl',
      },
      {
        url: videoData.thumbnailUrl,
        fieldName: 'thumbnailUrl',
      },
    ];

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(currentUserId, media);

    // Формируем данные для создания видео
    const dbData = {
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      previewUrl: videoData.previewUrl,
      category: videoData.category,
      isPublic: videoData.isPublic,
      duration: videoData.duration,
      size: videoData.size,
      uploadedBy: currentUserId,
      year: new Date().getFullYear(),
      viewsCount: 0,
    };

    // Создаем видео в базе данных
    const video = await Video.create(dbData);

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, media);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа видео ${video.id}:`,
        error.message
      );
    }

    // Автоматически добавляем в библиотеку создателя
    const libraryItem = await UserVideoLibrary.create({
      userId: currentUserId,
      videoId: video.id,
      isFavorite: true,
      viewsCount: 0,
      lastWatchedAt: null,
    });

    return {
      video: {
        ...video.toJSON(),
        isInLibrary: true,
        libraryId: libraryItem.id,
      },
    };
  },

  /**
   * Обновление приватности видео
   * @param {number} currentUserId - ID пользователя, обновляющего видео
   * @param {boolean} isPublic - Приватность видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async updateVideoPrivacy(currentUserId, { isPublic }) {
    // Обновляем приватность видео
    const [affectedCount] = await Video.update(
      { isPublic },
      { where: { uploadedBy: currentUserId } }
    );

    // Проверяем, найдены ли видео
    if (affectedCount === 0) {
      throw createError('Видео не найдены', 404, 'VIDEOS_NOT_FOUND');
    }

    // Возвращаем результат
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
    // Получаем видео
    const video = await Video.findByPk(videoId);

    // Проверяем, найдено ли видео
    if (!video) throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');

    // Проверяем, является ли текущий пользователь автором видео
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
        url: dbUpdates.videoUrl,
        fieldName: 'videoUrl',
      },
      {
        url: dbUpdates.previewUrl,
        fieldName: 'previewUrl',
      },
      {
        url: dbUpdates.thumbnailUrl,
        fieldName: 'thumbnailUrl',
      },
    ].filter(({ url, fieldName }) => {
      return url && url !== video[fieldName];
    });

    // Проверяем владение новыми медиа файлами
    await temporaryMediaService.assertOwnershipMany(
      currentUserId,
      newTemporaryMedia
    );

    // Обновляем видео в базе данных
    let updatedVideo;

    try {
      updatedVideo = await video.update(dbUpdates);
    } catch (error) {
      // Если обновление видео не удалось, то удаляем новые медиа файлы
      try {
        await temporaryMediaService.removeMany(
          currentUserId,
          newTemporaryMedia
        );
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить временные файлы для видео ${video.id}:`,
            cleanupError.message
          );
        }
      }
      throw createError('Не удалось обновить видео', 500, 'UPDATE_FAILED');
    }

    // Фиксируем новые медиа файлы
    try {
      await temporaryMediaService.commitMany(currentUserId, newTemporaryMedia);
    } catch (error) {
      console.warn(
        `Не удалось зафиксировать временные медиа видео ${video.id}:`,
        error.message
      );
    }
    return { video: updatedVideo.toJSON() };
  },

  /**
   * Инкремент счетчика просмотров видео
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>} - Объект с результатом
   */
  async incrementViewsCount(videoId) {
    // Инкрементируем счетчик просмотров видео
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
    // Получаем видео
    const video = await Video.findOne({
      where: { id: videoId, uploadedBy: currentUserId },
    });

    // Проверяем, найдено ли видео
    if (!video) {
      throw createError(
        'Видео не найдено или нет прав на удаление',
        404,
        'VIDEO_NOT_FOUND_OR_FORBIDDEN'
      );
    }

    // Удаляем видео (медиа файлы автоматически удалит cleanup() из mediaCleanupService по рассписанию)
    await video.destroy();

    return { message: 'Видео успешно удалено', videoId };
  },
};

module.exports = videoService;
