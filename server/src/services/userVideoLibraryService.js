const {
  UserVideoLibrary,
  Video,
  User,
  Like,
  Comment,
  Friend,
} = require('../../db/models');
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');
const createError = require('../utils/createError');

// Безопасный маппинг сортировки (защита от SQL-инъекций)
const SORT_MAP = {
  dateDesc: [['createdAt', 'DESC']],
  dateAsc: [['createdAt', 'ASC']],
  viewsDesc: [['viewsCount', 'DESC']],
  viewsAsc: [['viewsCount', 'ASC']],
};
const userVideoLibraryService = {
  /**
   * Получить мою видео библиотеку
   * @param {number} currentUserId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество видео на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>}
   */
  async getMyVideoLibrary(
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
    // Ищем все записи в библиотеке
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

    // Форматируем ответ, объединяя данные библиотеки и видео и добавляя количество комментариев и лайков
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
   * Получить библиотеку видео конкретного пользователя
   * @param {number} profileUserId - ID пользователя, библиотеку которого запрашивают
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество видео на странице
   * @param {string} sortKey - Ключ сортировки
   * @returns {Promise<Object>} - Объект с результатом
   */
  async getUserVideosLibrary(
    profileUserId,
    currentUserId,
    page = 1,
    limit = 30,
    sortKey = 'dateDesc'
  ) {
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

    // Формируем условие приватности для видео
    const videoWhere = {};
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

    // Создаем Map для быстрого поиска видео в библиотеке текущего пользователя
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
        libraryId: myLibraryId,
        // Данные из библиотеки просматриваемого профиля
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
      meta: {
        profileUserId: profileUserId,
        currentUserId: currentUserId || null,
        isOwnProfile: currentUserId === profileUserId,
        isFriend,
      },
    };
  },

  /**
   * Добавить видео в библиотеку
   * @param {number} currentUserId - ID пользователя
   * @param {number} videoId - ID видео
   * @returns {Promise<Object>}
   */
  async addToVideoLibrary(currentUserId, videoId) {
    // Проверяем, существует ли видео
    const video = await Video.findByPk(videoId, { attributes: ['id'] });
    if (!video) {
      throw createError('Видео не найдено', 404, 'VIDEO_NOT_FOUND');
    }

    // Ищем или создаем запись в библиотеке
    try {
      const [libraryItem, created] = await UserVideoLibrary.findOrCreate({
        where: { userId: currentUserId, videoId: videoId },
        defaults: {
          isFavorite: false,
          viewsCount: 0,
          lastWatchedAt: null,
        },
      });

      // Если запись не создана, выбрасываем ошибку
      if (!created) {
        throw createError(
          'Видео уже находится в библиотеке',
          400,
          'ALREADY_IN_LIBRARY'
        );
      }

      // Ищем запись в библиотеке с видео
      const itemWithVideo = await UserVideoLibrary.findByPk(libraryItem.id, {
        include: [
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'title'],
          },
        ],
      });

      // Возвращаем запись в библиотеке с видео
      return { libraryItem: itemWithVideo.toJSON() };
    } catch (error) {
      // Если ошибка связана с уникальным ограничением, выбрасываем ошибку
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
   * Обновить запись в библиотеке (избранное)
   * @param {number} currentUserId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @param {boolean} isFavorite - Состояние избранного
   * @returns {Promise<Object>}
   */
  async updateFavoriteVideo(currentUserId, libraryId, isFavorite) {
    const dbUpdates = {};
    dbUpdates.isFavorite = isFavorite;
    // Обновляем запись в библиотеке
    const [affectedCount, updatedRows] = await UserVideoLibrary.update(
      dbUpdates,
      {
        where: { id: libraryId, userId: currentUserId },
        returning: true,
        plain: true,
      }
    );

    // Если запись не обновлена, выбрасываем ошибку
    if (affectedCount === 0) {
      throw createError(
        'Запись в библиотеке не найдена или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    // Возвращаем обновленную запись в библиотеке
    return { libraryItem: updatedRows.toJSON() };
  },

  /**
   * Увеличить счетчики просмотров видео и обновить последний просмотр в библиотеке.
   * @param {number} libraryId - ID записи в библиотеке
   * @returns {Promise<Object>}
   */
  async incrementViewsCount(libraryId) {
    // Находим запись в библиотеке
    const libraryItem = await UserVideoLibrary.findByPk(libraryId);

    if (!libraryItem) {
      throw createError(
        'Запись в библиотеке не найдена',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    const now = new Date().toISOString();

    const result = await sequelize.transaction(async (transaction) => {
      // Увеличиваем счётчик в библиотеке и обновляем последний просмотр
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

      // Попутно увеличиваем глобальный счётчик просмотров видео
      await Video.increment('viewsCount', {
        by: 1,
        where: { id: libraryItem.videoId },
        transaction,
      });

      // Получаем обновлённые значения
      const updatedItem = await UserVideoLibrary.findOne({
        where: { id: libraryId },
        attributes: ['viewsCount', 'lastWatchedAt'],
        transaction,
      });

      return {
        libraryId,
        viewsCount: updatedItem.viewsCount,
        lastWatchedAt: updatedItem.lastWatchedAt,
      };
    });

    return result;
  },

  /**
   * Удалить видео из библиотеки
   * @param {number} currentUserId - ID пользователя
   * @param {number} libraryId - ID записи в библиотеке
   * @returns {Promise<Object>}
   */
  async deleteVideoFromLibrary(currentUserId, libraryId) {
    // Удаляем видео из библиотеки
    const deletedCount = await UserVideoLibrary.destroy({
      where: { id: libraryId, userId: currentUserId },
    });

    // Если видео не удалено, выбрасываем ошибку
    if (deletedCount === 0) {
      throw createError(
        'Видео в библиотеке не найдено или нет прав',
        404,
        'LIBRARY_ITEM_NOT_FOUND'
      );
    }

    // Возвращаем сообщение о удалении
    return { message: 'Видео удалено из библиотеки', libraryId };
  },
};

module.exports = userVideoLibraryService;
