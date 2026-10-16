const ffmpeg = require('fluent-ffmpeg');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { STAGING_ROOT } = require('../../config/mediaUploadConfig');
const mediaStorageService = require('./mediaStorageService');
const { createError } = require('../utils/createError');

/**
 * Сервис генерации короткого превью видео формата MP4
 * (для воспроизведения короткого ролика при наведении курсора на карточку видео),
 * и обложки видео формата JPG (для отображения обложки видео в списке видео).
 */
const videoPreviewService = {
  /**
   * Генерирует короткое превью из исходного видео.
   *
   * @param {string} videoPath - путь к исходному видео
   * @param {number} duration - длительность видео
   * @returns {Promise<string>} - путь к созданному preview
   */
  async generatePreview(videoPath, duration) {
    if (!videoPath) {
      throw createError('Путь к видео не указан', 400, 'VIDEO_PATH_REQUIRED');
    }

    /** Преобразуем путь к абсолютному. */
    const absoluteVideoPath = path.resolve(videoPath);

    /** Проверяем существование исходного видео. */
    try {
      await fs.access(absoluteVideoPath);
    } catch {
      throw createError(
        `Исходное видео не найдено: ${absoluteVideoPath}`,
        404,
        'VIDEO_NOT_FOUND'
      );
    }

    /** Директория, в которой будут храниться временные превью. */
    const previewDir = path.join(STAGING_ROOT, 'generated');

    await fs.mkdir(previewDir, {
      recursive: true,
      mode: 0o700,
    });

    const previewPath = path.join(previewDir, `${randomUUID()}.mp4`);

    /** Максимальная длительность превью — 5 секунд. */
    const previewDuration = Math.min(5, duration);

    /** Начинаем с времени, которое составляет 25% от длительности видео или с начала видео, если длительность видео меньше 5 секунд. */
    const startTime = Math.max(
      0,
      Math.min(duration * 0.25, duration - previewDuration)
    );

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(absoluteVideoPath)
          .setStartTime(startTime)
          .duration(previewDuration)
          .videoCodec('libx264')
          .outputOptions([
            '-preset veryfast',
            '-crf 28',
            '-movflags +faststart',
            '-pix_fmt yuv420p',
          ])
          .noAudio()
          .format('mp4')
          .output(previewPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return await mediaStorageService.publishGeneratedFile(
        previewPath,
        'preview'
      );
    } catch (error) {
      await fs.unlink(previewPath).catch((cleanupError) => {
        if (cleanupError.code !== 'ENOENT') {
          console.error('[VideoPreview] Ошибка очистки превью:', cleanupError);
        }
      });

      console.error('[VideoPreview] Ошибка генерации превью:', error);

      throw createError(
        'Ошибка генерации или публикации превью видео',
        500,
        'VIDEO_PREVIEW_GENERATION_ERROR'
      );
    }
  },

  /**
   * Генерирует обложку видео из исходного видео.
   *
   * @param {string} videoPath - путь к исходному видео
   * @param {number} duration - длительность видео
   * @returns {Promise<string>} - путь к созданной обложке
   */
  async generateThumbnail(videoPath, duration) {
    if (!videoPath) {
      throw createError('Путь к видео не указан', 400, 'VIDEO_PATH_REQUIRED');
    }

    const absoluteVideoPath = path.resolve(videoPath);

    try {
      await fs.access(absoluteVideoPath);
    } catch {
      throw createError(
        `Исходное видео не найдено: ${absoluteVideoPath}`,
        404,
        'VIDEO_NOT_FOUND'
      );
    }

    const thumbnailDir = path.join(STAGING_ROOT, 'generated');

    await fs.mkdir(thumbnailDir, {
      recursive: true,
      mode: 0o700,
    });

    const thumbnailPath = path.join(thumbnailDir, `${randomUUID()}.jpg`);

    const startTime = duration > 5 ? 5 : 0;

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(absoluteVideoPath)
          .setStartTime(startTime)
          .frames(1)
          .size('640x360')
          .format('image2')
          .output(thumbnailPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return await mediaStorageService.publishGeneratedFile(
        thumbnailPath,
        'thumbnail'
      );
    } catch (error) {
      await fs.unlink(thumbnailPath).catch((cleanupError) => {
        if (cleanupError.code !== 'ENOENT') {
          console.error('[VideoPreview] Ошибка очистки обложки:', cleanupError);
        }
      });

      console.error('[VideoPreview] Ошибка генерации обложки:', error);

      throw createError(
        'Ошибка генерации или публикации обложки видео',
        500,
        'VIDEO_THUMBNAIL_GENERATION_ERROR'
      );
    }
  },
};

module.exports = videoPreviewService;
