const fs = require('fs').promises;
const { Op } = require('sequelize');

const { TemporaryMedia } = require('../../db/models');
const { createError } = require('../utils/createError');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

/** Срок действия временного медиафайла в миллисекундах */
const TEMPORARY_MEDIA_TTL = 24 * 60 * 60 * 1000;

const temporaryMediaService = {
  /**
   * Регистрирует несколько временных медиафайлов
   * @param {Object[]} items - массив объектов с параметрами запроса
   * @returns {Promise<Object[]>} - массив объектов с временными медиафайлами
   */
  async registerMany(items) {
    const normalizedItems = items.filter((item) => item?.url);

    if (normalizedItems.length === 0) {
      return [];
    }
    const expiresAt = new Date(Date.now() + TEMPORARY_MEDIA_TTL);

    const transaction = await TemporaryMedia.sequelize.transaction();

    try {
      const media = await TemporaryMedia.bulkCreate(
        normalizedItems.map((item) => ({
          ...item,
          expiresAt,
        })),
        { transaction }
      );

      await transaction.commit();

      return media;
    } catch (error) {
      await transaction.rollback();

      for (const item of normalizedItems) {
        try {
          const filePath = fromPublicUrl(item.url);
          await fs.unlink(filePath);
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.warn(
              `Не удалось удалить файл после ошибки регистрации ${item.url}:`,
              cleanupError.message
            );
          }
        }
      }

      throw error;
    }
  },

  /**
   * Проверяет владение несколькими временными медиафайлами
   * @param {number} currentUserId - ID пользователя
   * @param {Object[]} items - массив объектов с параметрами запроса
   * @returns {Promise<Object[]>} - массив объектов с временными медиафайлами
   */
  async assertOwnershipMany(currentUserId, items) {
    const normalizedItems = items.filter((item) => item?.url);

    const mediaRecords = [];

    for (const item of normalizedItems) {
      const where = {
        userId: currentUserId,
        url: item.url,
      };

      if (item.fieldName) {
        where.fieldName = item.fieldName;
      }

      const media = await TemporaryMedia.findOne({ where });

      if (!media) {
        throw createError(
          'Временный медиафайл не принадлежит пользователю',
          403,
          'TEMPORARY_MEDIA_FORBIDDEN'
        );
      }

      if (media.expiresAt <= new Date()) {
        throw createError(
          'Срок действия временного медиафайла истёк',
          410,
          'TEMPORARY_MEDIA_EXPIRED'
        );
      }

      mediaRecords.push(media);
    }

    return mediaRecords;
  },

  /**
   * Удаляет несколько временных медиафайлов
   * @param {number} currentUserId - ID пользователя
   * @param {Object[]} items - массив объектов с параметрами запроса
   * @returns {Promise<Object>} - Объект с результатом
   */
  async removeMany(currentUserId, items) {
    const mediaRecords = await this.assertOwnershipMany(currentUserId, items);

    for (const media of mediaRecords) {
      try {
        const filePath = fromPublicUrl(media.url);
        if (filePath) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(
            `Не удалось удалить временный файл ${media.url}:`,
            error.message
          );
        }
      }
    }

    for (const media of mediaRecords) {
      await media.destroy();
    }

    return {
      message: 'Временные медиафайлы успешно удалены',
    };
  },

  /**
   * Фиксирует несколько временных медиафайлов
   * @param {number} currentUserId - ID пользователя
   * @param {Object[]} items - массив объектов с параметрами запроса
   * @returns {Promise<Object[]>} - массив объектов с временными медиафайлами
   */
  async commitMany(currentUserId, items) {
    const mediaRecords = await this.assertOwnershipMany(currentUserId, items);

    for (const media of mediaRecords) {
      if (!media.url) continue;
      await media.destroy();
    }

    return mediaRecords;
  },

  /**
   * Очищает просроченные временные медиафайлы
   * @returns {Promise<number>} - Количество удаленных временных медиафайлов
   */
  async cleanupExpired() {
    const deletedCount = await TemporaryMedia.destroy({
      where: {
        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
    });

    return deletedCount;
  },
};

module.exports = temporaryMediaService;
