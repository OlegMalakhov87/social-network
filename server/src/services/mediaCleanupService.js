const fs = require('fs').promises;
const path = require('path');

const MEDIA_CLEANUP_CONFIG = require('../../config/mediaCleanupConfig');
const fromPublicUrl = require('../utils/fromPublicUrl');

/** Время жизни orphan-файла — 24 часа */
const ONE_DAY = 24 * 60 * 60 * 1000;

/** Файлы, которые нельзя удалять */
const PROTECTED_FILES = new Set([
  'default-user.png',
  'default-image.jpg',
  'default-video.mp4',
  'default-preview.mp4',
  'default-track.mp3',
]);

const mediaCleanupService = {
  /**
   * Собирает абсолютные пути файлов,
   * которые используются существующими сущностями в БД.
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

          const urls = this.extractUrls(value);

          for (const url of urls) {
            try {
              const filePath = fromPublicUrl(url);

              usedFiles.add(path.resolve(filePath));
            } catch {
              // Некорректный URL пропускаем.
            }
          }
        }
      }
    }
   
    return usedFiles;
  },

  /**
   * Извлекает URL из значения поля.
   *
   * Поддерживает:
   * - string
   * - array
   */
  extractUrls(value) {
    if (typeof value === 'string') {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === 'string');
    }

    return [];
  },

  /**
   * Рекурсивно получает все файлы из uploads/.
   *
   * @param {string} directory - директория для поиска
   * @returns {Promise<string[]>} абсолютные пути файлов
   */
  async getAllFiles(directory = MEDIA_CLEANUP_CONFIG.root) {
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
   * Проверяет, находится ли файл внутри разрешённой директории.
   *
   * Это дополнительная защита перед удалением.
   */
  isInsideMediaRoot(filePath) {
    const root = path.resolve(MEDIA_CLEANUP_CONFIG.root);
    const target = path.resolve(filePath);

    return target.startsWith(`${root}${path.sep}`);
  },

  /**
   * Удаляет неиспользуемые медиафайлы,
   * которые старше 24 часов.
   */
  async cleanup() {
    const usedFiles = await this.collectUsedFiles();
    const files = await this.getAllFiles();

    const now = Date.now();

    let deletedCount = 0;
    let skippedCount = 0;

    for (const filePath of files) {
      const absolutePath = path.resolve(filePath);

      // Дополнительная защита от удаления файлов за пределами uploads.
      if (!this.isInsideMediaRoot(absolutePath)) {
        skippedCount++;
        continue;
      }

      // Файл используется сущностью.
      if (usedFiles.has(absolutePath)) {
        skippedCount++;
        continue;
      }

      // Защищённый файл.
      if (PROTECTED_FILES.has(path.basename(absolutePath))) {
        skippedCount++;
        continue;
      }

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

      // Файл ещё слишком молодой.
      if (age < ONE_DAY) {
        skippedCount++;
        continue;
      }

      try {
        await fs.unlink(absolutePath);
        deletedCount++;
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        }

        console.error(`[MediaCleanup] Ошибка удаления ${absolutePath}:`, error);
      }
    }

    return {
      scanned: files.length,
      used: usedFiles.size,
      deleted: deletedCount,
      skipped: skippedCount,
    };
  },
};

module.exports = mediaCleanupService;
