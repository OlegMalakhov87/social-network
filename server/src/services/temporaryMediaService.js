const fs = require('node:fs/promises');
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

    return TemporaryMedia.sequelize.transaction(async (transaction) => {
      return TemporaryMedia.bulkCreate(
        normalizedItems.map((item) => ({
          ...item,
          expiresAt,
        })),
        { transaction }
      );
    });
  },

  /**
   * Проверяет владение временными медиафайлами.
   *
   * @param {number} currentUserId
   * @param {Object[]} items
   * @param {Object} options
   * @param {import('sequelize').Transaction} [options.transaction]
   * @returns {Promise<Object[]>}
   */
  async assertOwnershipMany(currentUserId, items, options = {}) {
    const normalizedItems = items.filter((item) => item?.url);
    const { transaction } = options;

    const mediaRecords = [];

    for (const item of normalizedItems) {
      const where = {
        userId: currentUserId,
        url: item.url,
      };

      if (item.fieldName) {
        where.fieldName = item.fieldName;
      }

      const media = await TemporaryMedia.findOne({
        where,
        ...(transaction && {
          transaction,
          lock: transaction.LOCK.UPDATE,
        }),
      });

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
   * Отменяет временные загрузки пользователя.
   *
   * Удаляет записи TemporaryMedia.
   * Физические файлы удаляются фоновой очисткой.
   */
  async removeMany(currentUserId, items) {
    const normalizedItems = items.filter(
      (item) => item?.url && item?.fieldName
    );

    if (normalizedItems.length === 0) {
      return {
        message: 'Нет временных медиафайлов для удаления',
        deleted: 0,
      };
    }

    return TemporaryMedia.sequelize.transaction(async (transaction) => {
      let deleted = 0;

      for (const { url, fieldName } of normalizedItems) {
        const count = await TemporaryMedia.destroy({
          where: {
            userId: currentUserId,
            url,
            fieldName,
          },
          transaction,
        });

        deleted += count;
      }

      return {
        message: 'Временные медиафайлы помечены для очистки',
        deleted,
      };
    });
  },

  /**
   * Фиксирует временные медиафайлы.
   *
   * @param {number} currentUserId
   * @param {Object[]} items
   * @param {Object} options
   * @returns {Promise<Object[]>}
   */
  async commitMany(currentUserId, items, options = {}) {
    const execute = async (transaction) => {
      const mediaRecords = await this.assertOwnershipMany(
        currentUserId,
        items,
        { transaction }
      );

      for (const media of mediaRecords) {
        await media.destroy({ transaction });
      }

      return mediaRecords;
    };

    if (options.transaction) {
      return execute(options.transaction);
    }

    return TemporaryMedia.sequelize.transaction(execute);
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
    console.log(
      '[TemporaryMediaService] Удалены временные медиафайлы с истекшим сроком хранения:',
      deletedCount
    );
    return deletedCount;
  },
};

module.exports = temporaryMediaService;
