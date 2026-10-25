const { Op } = require('sequelize');

const {
  UserVideoLibrary,
  Video,
  User,
  Like,
  Comment,
  Friend,
} = require('../../db/models');
const { sequelize } = require('../../db/models');
const { createError } = require('../utils/createError');

// Ограничивает сортировку известными полями и закрывает подстановку SQL.
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};
const userVideoLibraryService = {
  /**
   * Возвращает библиотеку видео текущего пользователя.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getMyVideoLibrary({
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc',
  } = {}) {
    const { count, rows: libraryEntries } =
      await UserVideoLibrary.findAndCountAll({
        where: { userId: currentUserId },
        attributes: [
          'id',
          'userId',
          'videoId',
          'isFavorite',
          'viewsCount',
          'lastWatchedAt',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Video,
            as: 'video',
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

    // Форматирует ответ, объединяя данные библиотеки и видео и добавляя количество комментариев и лайков.
    const videos = libraryEntries.map((entry) => {
      const videoData = entry.video?.toJSON() || {};

      return {
        ...videoData,
        isInLibrary: true,
        libraryId: entry.id,
        isFavorite: entry.isFavorite,
        viewsCount: entry.viewsCount,
        lastWatchedAt: entry.lastWatchedAt,
        libraryCreatedAt: entry.createdAt,
        commentsCount: videoData.comments?.length,
        likesCount: videoData.likes?.length,
        isLiked: videoData.likes?.some((like) => like.userId === currentUserId),
      };
    });

    return {
      videos,
      pagination: {
        totalVideos: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Возвращает библиотеку видео выбранного пользователя.
   *
   * @param {Object} params - Параметры вызова
   * @param {number} params.profileUserId - Идентификатор владельца профиля
   * @param {number} params.currentUserId - Идентификатор текущего пользователя
   * @param {number} [params.page=1] - Номер страницы
   * @param {number} [params.limit=30] - Размер страницы
   * @param {string} [params.sortKey='dateDesc'] - Ключ сортировки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async getUserVideosLibrary({
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

    const videoWhere = {};
    // Если текущий пользователь не просматривает свой профиль, то добавляет условие приватности.
    if (currentUserId !== profileUserId) {
      videoWhere[Op.or] = [{ isPublic: true }];
      if (isFriend) videoWhere[Op.or].push({ isPublic: false });
    }

    const { count, rows: libraryEntries } =
      await UserVideoLibrary.findAndCountAll({
        where: { userId: profileUserId },
        attributes: [
          'id',
          'userId',
          'videoId',
          'isFavorite',
          'viewsCount',
          'lastWatchedAt',
          'createdAt',
          'updatedAt',
        ],
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

    // Создает Map для быстрого поиска видео в библиотеке текущего пользователя для оптимизации запросов.
    let currentUserLibraryMap = new Map();
    if (
      currentUserId &&
      currentUserId !== profileUserId &&
      libraryEntries.length > 0
    ) {
      const videoIds = libraryEntries.map((entry) => entry.videoId);
      const myEntries = await UserVideoLibrary.findAll({
        where: { userId: currentUserId, videoId: { [Op.in]: videoIds } },
        attributes: ['videoId', 'id'],
        raw: true,
      });
      // Создает Map для быстрого поиска видео в библиотеке текущего пользователя.
      currentUserLibraryMap = new Map(myEntries.map((e) => [e.videoId, e.id]));
    }

    const formattedVideos = libraryEntries.map((entry) => {
      const videoData = entry.video?.toJSON() || {};
      const myLibraryId = currentUserLibraryMap.get(entry.videoId);

      return {
        ...videoData,
        // Данные для кнопки текущего пользователя.
        isInLibrary: !!myLibraryId,
        libraryId: myLibraryId,
        // Данные из библиотеки просматриваемого профиля.
        profileLibraryId: entry.id,
        viewsCount: entry.viewsCount,
        commentsCount: videoData.comments?.length,
        likesCount: videoData.likes?.length,
        isLiked: videoData.likes?.some((like) => like.userId === currentUserId),
        lastWatchedAt: entry.lastWatchedAt,
        libraryCreatedAt: entry.createdAt,
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
   * Добавляет видео в библиотеку.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {number} videoId - Идентификатор видео
   * @returns {Promise<Object>} Объект с результатом.
   */
  async addToVideoLibrary(currentUserId, videoId) {
    const video = await Video.findByPk(videoId, { attributes: ['id'] });
    if (!video) {
      throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');
    }

    try {
      const [libraryItem, created] = await UserVideoLibrary.findOrCreate({
        where: { userId: currentUserId, videoId: videoId },
        defaults: {
          isFavorite: false,
          viewsCount: 0,
          lastWatchedAt: null,
        },
      });

      // Если запись не создана, выбрасывает ошибку.
      if (!created) {
        throw createError(
          'Видео уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }

      const itemWithVideo = await UserVideoLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'title'],
          },
        ],
      });

      return { libraryItem: itemWithVideo.toJSON() };
    } catch (error) {
      // Если ошибка связана с уникальным ограничением, выбрасывает ошибку.
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createError(
          'Видео уже находится в библиотеке',
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
  async updateFavoriteVideo(currentUserId, libraryId, isFavorite) {
    const [affectedCount, updatedRows] = await UserVideoLibrary.update(
      { isFavorite },
      {
        where: { id: libraryId, userId: currentUserId },
        returning: true,
        plain: true,
      }
    );

    // Если запись не обновлена, выбрасывает ошибку.
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
   * Увеличивает счетчик просмотров и сохраняет время последнего просмотра.
   *
   * @param {number} libraryId - Идентификатор записи библиотеки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async incrementViewsCount(libraryId) {
    const libraryItem = await UserVideoLibrary.findByPk(libraryId);

    if (!libraryItem) {
      throw createError(
        'Запись в библиотеке не найдена',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    const now = new Date().toISOString();

    // Атомарно увеличивает счётчик просмотров видео в библиотеке и глобальный счётчик просмотров видео.
    const updatedItem = await sequelize.transaction(async (transaction) => {
      // Увеличивает счетчик в библиотеке и обновляет время последнего просмотра.
      await UserVideoLibrary.update(
        {
          viewsCount: sequelize.literal('"viewsCount" + 1'),
          lastWatchedAt: now,
        },
        {
          where: { id: libraryId },
          transaction,
        }
      );

      // Увеличивает общий счетчик просмотров видео.
      await Video.increment('viewsCount', {
        by: 1,
        where: { id: libraryItem.videoId },
        transaction,
      });

      return UserVideoLibrary.findByPk(libraryId, {
        attributes: ['viewsCount', 'lastWatchedAt'],
        transaction,
      });
    });

    return {
      libraryId,
      viewsCount: updatedItem.viewsCount,
      lastWatchedAt: updatedItem.lastWatchedAt,
    };
  },

  /**
   * Удаляет видео из библиотеки.
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {number} libraryId - Идентификатор записи библиотеки
   * @returns {Promise<Object>} Объект с результатом.
   */
  async deleteVideoFromLibrary(currentUserId, libraryId) {
    const deletedCount = await UserVideoLibrary.destroy({
      where: { id: libraryId, userId: currentUserId },
    });

    // Если видео не удалено, выбрасывает ошибку.
    if (deletedCount === 0) {
      throw createError(
        'Видео в библиотеке не найдено или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    return { message: 'Видео удалено из библиотеки', libraryId };
  },
};

module.exports = userVideoLibraryService;
