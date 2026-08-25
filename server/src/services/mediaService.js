const ffmpeg = require('fluent-ffmpeg');

const mediaService = {
  /**
   * Получает метаданные медиафайла.
   *
   * @param {string} filePath - путь к медиафайлу
   * @returns {Promise<Object>}
   */
  async getMetadata(filePath) {
    if (!filePath) {
      throw new Error('Путь к медиафайлу не указан');
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          return reject(
            new Error(`Ошибка получения метаданных: ${error.message}`)
          );
        }

        resolve({
          duration: Math.round(metadata.format.duration || 0),
          size: Number(metadata.format.size || 0),
        });
      });
    });
  },
};

module.exports = mediaService;