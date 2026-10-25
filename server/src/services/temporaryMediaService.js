const { Op } = require('sequelize');

const { TemporaryMedia } = require('../../db/models');
const { createError } = require('../utils/createError');

/**
 * Задает срок действия временного медиафайла в миллисекундах.
 */
const TEMPORARY_MEDIA_TTL = 24 * 60 * 60 * 1000;

const temporaryMediaService = {
  /**
   * Регистрирует несколько временных медиафайлов.
   *
   * @param {Object[]} items - Список временных медиафайлов
   * @returns {Promise<Object[]>} Массив объектов с временными медиафайлами.
   */
  async registerMany(items) {
    if (
      !Array.isArray(items) ||
      items.some(
        (item) =>
          typeof item?.url !== 'string' ||
          !item.url.trim() ||
          typeof item?.fieldName !== 'string' ||
          !item.fieldName.trim()
      )
    ) {
      throw createError(
        'Некорректные параметры временных медиафайлов',
        400,
        'INVALID_TEMPORARY_MEDIA'
      );
    }

    if (items.length === 0) {
      return [];
    }

    const expiresAt = new Date(Date.now() + TEMPORARY_MEDIA_TTL);

    return TemporaryMedia.sequelize.transaction(async (transaction) => {
      return TemporaryMedia.bulkCreate(
        items.map((item) => ({
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
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object[]} items - Список временных медиафайлов
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Promise<Object[]>} Список объектов.
   */
  async assertOwnershipMany(currentUserId, items, options = {}) {
    const { transaction } = options;

    if (
      !Array.isArray(items) ||
      items.some(
        (item) =>
          typeof item?.url !== 'string' ||
          !item.url.trim() ||
          typeof item?.fieldName !== 'string' ||
          !item.fieldName.trim()
      )
    ) {
      throw createError(
        'Некорректные параметры временных медиафайлов',
        400,
        'INVALID_TEMPORARY_MEDIA'
      );
    }

    const mediaRecords = [];

    for (const { url, fieldName } of items) {
      const media = await TemporaryMedia.findOne({
        where: {
          userId: currentUserId,
          url,
          fieldName,
        },
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
   *
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Array} items - Список временных медиафайлов
   * @returns {Promise<Object>} Результат операции.
   */
  async removeMany(currentUserId, items) {
    if (
      !Array.isArray(items) ||
      items.some(
        (item) =>
          typeof item?.url !== 'string' ||
          !item.url.trim() ||
          typeof item?.fieldName !== 'string' ||
          !item.fieldName.trim()
      )
    ) {
      throw createError(
        'Некорректные параметры временных медиафайлов',
        400,
        'INVALID_TEMPORARY_MEDIA'
      );
    }

    if (items.length === 0) {
      return {
        message: 'Нет временных медиафайлов для удаления',
        deleted: 0,
      };
    }

    return TemporaryMedia.sequelize.transaction(async (transaction) => {
      let deleted = 0;

      for (const { url, fieldName } of items) {
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
   * @param {number} currentUserId - Идентификатор текущего пользователя
   * @param {Object[]} items - Список временных медиафайлов
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Promise<Object[]>} Список объектов.
   */
  async commitMany(currentUserId, items, options = {}) {
    /**
     * Фиксирует временные файлы внутри переданной транзакции.
     *
     * @param {import('sequelize').Transaction} transaction - Транзакция Sequelize
     * @returns {Promise<void>} Завершает операцию.
     */
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
   * Очищает просроченные временные медиафайлы.
   *
   * @returns {Promise<number>} Количество удаленных временных медиафайлов.
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
