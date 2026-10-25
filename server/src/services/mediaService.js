const ffmpeg = require('fluent-ffmpeg');

const { createError } = require('../utils/createError');

const MEDIA_TYPES = {
  video: 'video',
  audio: 'audio',
};

const mediaService = {
  /**
   * Получает и проверяет метаданные медиафайла.
   *
   * @param {string} filePath - Путь к файлу
   * @param {'video'|'audio'} [mediaType='video'] - Тип медиа
   * @returns {Promise<{ duration: number, size: number }>} Длительность и размер файла.
   */
  async getMetadata(filePath, mediaType = 'video') {
    if (!filePath) {
      throw createError(
        'Путь к медиафайлу не указан',
        400,
        'MEDIA_PATH_REQUIRED'
      );
    }

    if (!MEDIA_TYPES[mediaType]) {
      throw createError(
        'Неподдерживаемый тип медиа',
        400,
        'UNSUPPORTED_MEDIA_TYPE'
      );
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          return reject(
            createError(
              `Не удалось прочитать метаданные`,
              400,
              'INVALID_VIDEO_FILE'
            )
          );
        }

        const requiredStream = metadata?.streams?.find(
          (stream) => stream.codec_type === mediaType
        );

        if (!requiredStream) {
          return reject(
            createError(
              `Файл не содержит ${mediaType === 'video' ? 'видеопоток' : 'аудиопоток'}`,
              400,
              'MEDIA_STREAM_NOT_FOUND'
            )
          );
        }

        const formatDuration = Number(metadata?.format?.duration);
        const streamDuration = Number(requiredStream.duration);

        const duration =
          Number.isFinite(formatDuration) && formatDuration > 0
            ? formatDuration
            : streamDuration;

        const size = Number(metadata?.format?.size);

        if (!Number.isFinite(duration) || duration <= 0) {
          return reject(
            createError(
              'Некорректная длительность медиафайла',
              400,
              'INVALID_MEDIA_DURATION'
            )
          );
        }

        if (!Number.isFinite(size) || size <= 0) {
          return reject(
            createError(
              'Некорректный размер медиафайла',
              400,
              'INVALID_MEDIA_SIZE'
            )
          );
        }

        resolve({
          duration,
          size,
        });
      });
    });
  },
};

module.exports = mediaService;
