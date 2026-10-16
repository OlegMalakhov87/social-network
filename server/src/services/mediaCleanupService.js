const fs = require('fs').promises;
const path = require('node:path');
const { Op } = require('sequelize');
const { TemporaryMedia } = require('../../db/models');
const { MEDIA_CLEANUP_CONFIG } = require('../../config/mediaCleanupConfig');
const {
  MEDIA_ROOT,
  STAGING_ROOT,
  PUBLISH_STAGING_ROOT,
} = require('../../config/mediaUploadConfig');
const { fromPublicUrl } = require('../utils/fromPublicUrl');

const STAGING_FILE_TTL =
  24 * 60 * 60 * 1000; /** Время жизни staging-файла — 24 часа */
const ORPHAN_FILE_TTL =
  48 * 60 * 60 * 1000; /** Время жизни orphan-файла — 2 дня */

/**
 * Извлекает URL из значения поля.
 *
 * Поддерживает:
 * - string
 * - array
 */
const extractUrls = (value) => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }

  return [];
};

/**
 * Проверяет, находится ли файл внутри разрешённой директории.
 *
 * Это дополнительная защита перед удалением.
 */
const isInsideMediaRoot = (filePath) => {
  const root = path.resolve(MEDIA_ROOT);
  const target = path.resolve(filePath);

  return target.startsWith(`${root}${path.sep}`);
};

/**
 * Сервис для очистки медиафайлов из директорий:
 *  - MEDIA_ROOT
 *  - STAGING_ROOT
 *  - PUBLISH_STAGING_ROOT
 */
const mediaCleanupService = {
  /**
   * Собирает абсолютные пути файлов, используемыми сущностями в БД.
   */
  async collectUsedFiles() {
    const usedFiles = new Set();

    for (const { model, fields } of MEDIA_CLEANUP_CONFIG.entities) {
      const rows = await model.findAll({
        attributes: fields,
        raw: true,
      });

      for (const row of rows) {
        for (const field of fields) {
          const value = row[field];

          if (!value) continue;

          const urls = extractUrls(value);

          for (const url of urls) {
            try {
              const filePath = fromPublicUrl(url);

              if (!filePath) {
                continue;
              }

              usedFiles.add(path.resolve(filePath));
            } catch (error) {
              throw new Error(
                `[MediaCleanup] Не удалось обработать media URL "${url}": ${error.message}`
              );
            }
          }
        }
      }
    }
    // Учитываем временные медиа, которые ещё не привязаны к сущностям.
    const temporaryMedia = await TemporaryMedia.findAll({
      attributes: ['url'],
      raw: true,
    });

    for (const media of temporaryMedia) {
      if (!media.url) continue;

      const filePath = fromPublicUrl(media.url);

      if (filePath) {
        usedFiles.add(path.resolve(filePath));
      }
    }
    return usedFiles;
  },

  /**
   * Рекурсивно получает все файлы из uploads/.
   *
   * @param {string} directory - директория для поиска
   * @returns {Promise<string[]>} абсолютные пути файлов
   */
  async getAllFiles(directory = MEDIA_ROOT) {
    const files = [];

    const entries = await fs.readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        const nestedFiles = await this.getAllFiles(fullPath);

        files.push(...nestedFiles);
        continue;
      }

      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files;
  },

  /**
   * Удаляет неиспользуемые orphan-файлы, из директории MEDIA_ROOT.
   *
   */
  async cleanup() {
    console.log('[MediaCleanup] Старт очистки...');
    console.log('[MediaCleanup] MEDIA_ROOT:', MEDIA_ROOT);

    const usedFiles = await this.collectUsedFiles();
    const files = await this.getAllFiles();

    console.log(
      '[MediaCleanup] Ссылки на медиафайлы в БД собраны:',
      usedFiles.size
    );
    console.log(
      '[MediaCleanup] Физические файлы просканированы:',
      files.length
    );

    const now = Date.now();

    let deletedCount = 0;
    let skippedCount = 0;
    let youngCount = 0;
    let orphanCount = 0;

    for (const filePath of files) {
      const absolutePath = path.resolve(filePath);

      /** Дополнительная защита от удаления файлов за пределами uploads. */
      if (!isInsideMediaRoot(absolutePath)) {
        skippedCount++;
        continue;
      }

      if (usedFiles.has(absolutePath)) {
        skippedCount++;
        continue;
      }

      orphanCount++;

      let stat;

      try {
        stat = await fs.stat(absolutePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        }

        throw error;
      }

      const age = now - stat.mtimeMs;

      if (age < ORPHAN_FILE_TTL) {
        youngCount++;
        continue;
      }

      try {
        await fs.unlink(absolutePath);
        deletedCount++;
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        }
        console.error(
          '[MediaCleanup] Ошибка удаления файла:',
          absolutePath,
          error
        );
      }
    }

    console.log('[MediaCleanup] Неиспользуемые файлы найдены:', orphanCount);
    console.log('[MediaCleanup] Неиспользуемые файлы удалены:', deletedCount);
    console.log('[MediaCleanup] Пропущено (моложе 2 дней):', youngCount);
    console.log('[MediaCleanup] Очистка завершена успешно.');

    return {
      scanned: files.length,
      used: usedFiles.size,
      orphan: orphanCount,
      deleted: deletedCount,
      skipped: skippedCount,
      young: youngCount,
    };
  },

  /**
   * Удаляет устаревшие файлы из закрытых
   * staging-директорий: STAGING_ROOT, PUBLISH_STAGING_ROOT.
   *
   * Не затрагивает публичный MEDIA_ROOT.
   */
  async cleanupStaging() {
    console.log('[StagingCleanup] Старт очистки...');

    const directories = [
      STAGING_ROOT,
      path.join(STAGING_ROOT, 'generated'),
      PUBLISH_STAGING_ROOT,
    ];

    const now = Date.now();

    let scannedCount = 0;
    let deletedCount = 0;
    let skippedCount = 0;
    let ignoredCount = 0;
    let errorCount = 0;

    for (const directory of directories) {
      let entries;

      try {
        entries = await fs.readdir(directory, {
          withFileTypes: true,
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        }

        throw error;
      }

      for (const entry of entries) {
        if (!entry.isFile()) {
          skippedCount++;
          continue;
        }

        const filePath = path.join(directory, entry.name);

        scannedCount++;

        try {
          const stats = await fs.stat(filePath);

          if (now - stats.mtimeMs < STAGING_FILE_TTL) {
            skippedCount++;
            continue;
          }

          await fs.unlink(filePath);
          deletedCount++;
        } catch (error) {
          if (error.code === 'ENOENT') {
            ignoredCount++;
            continue;
          }

          errorCount++;

          console.error(
            '[StagingCleanup] Ошибка удаления файла:',
            filePath,
            error
          );
        }
      }
    }

    console.log('[StagingCleanup] Проверено:', scannedCount);
    console.log('[StagingCleanup] Удалено:', deletedCount);
    console.log('[StagingCleanup] Пропущено по TTL:', skippedCount);
    console.log('[StagingCleanup] Игнорировано:', ignoredCount);
    console.log('[StagingCleanup] Ошибок:', errorCount);

    return {
      scanned: scannedCount,
      deleted: deletedCount,
      skipped: skippedCount,
      ignored: ignoredCount,
      errors: errorCount,
    };
  },
};

module.exports = mediaCleanupService;
