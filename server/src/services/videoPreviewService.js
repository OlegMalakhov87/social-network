const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

/**
 * Сервис генерации короткого превью видео формата MP4 (для воспроизведения короткого ролика при наведении курсора на карточку видео), и обложки видео формата JPG (для отображения обложки видео в списке видео).
 *
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
      throw new Error('Путь к видео не указан');
    }

    // Преобразуем путь к абсолютному.
    const absoluteVideoPath = path.resolve(videoPath);

    // Проверяем существование исходного видео.
    try {
      await fs.access(absoluteVideoPath);
    } catch {
      throw new Error(`Исходное видео не найдено: ${absoluteVideoPath}`);
    }

    // Директория, в которой будут храниться превью.
    const previewDir = path.join(path.dirname(absoluteVideoPath), 'previews');

    // Создаём директорию, если её ещё нет.
    await fs.mkdir(previewDir, { recursive: true });

    // Имя исходного файла без расширения.
    const fileName = path.basename(
      absoluteVideoPath,
      path.extname(absoluteVideoPath)
    );

    // Путь к будущему превью.
    const previewFileName = `${fileName}-preview.mp4`;

    const previewPath = path.join(previewDir, previewFileName);

    const startTime = Math.max(0, Math.min(duration * 0.25, 5));

    return new Promise((resolve, reject) => {
      ffmpeg(absoluteVideoPath)
        .setStartTime(startTime) // Начинаем с времени, которое составляет 25% от длительности видео или с начала видео, если длительность видео меньше 5 секунд.
        .duration(5) // Максимальная длительность превью — 5 секунд.
        .videoCodec('libx264') // Выходной формат.
        .outputOptions([
          '-preset veryfast', // Настройка качества/размера файла.
          '-crf 28', // Качество видео.
          '-movflags +faststart', // Настройка качества/размера файла.
          '-pix_fmt yuv420p', // Формат видео.
        ])
        .noAudio() // Без звука.
        .format('mp4') // Формат MP4.
        .output(previewPath) // Куда сохраняем результат.
        .on('end', () => {
          resolve(previewPath); // Успешное завершение.
        })
        .on('error', (error) => {
          reject(new Error(`Ошибка генерации превью видео: ${error.message}`)); // Ошибка FFmpeg.
        })
        .run(); // Запускаем FFmpeg.
    });
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
      throw new Error('Путь к видео не указан');
    }

    const absoluteVideoPath = path.resolve(videoPath);

    try {
      await fs.access(absoluteVideoPath);
    } catch {
      throw new Error(`Исходное видео не найдено: ${absoluteVideoPath}`);
    }

    const thumbnailDir = path.join(
      path.dirname(absoluteVideoPath),
      'thumbnails'
    );
    await fs.mkdir(thumbnailDir, { recursive: true });

    const fileName = path.basename(
      absoluteVideoPath,
      path.extname(absoluteVideoPath)
    );

    const thumbnailFileName = `${fileName}-thumbnail.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);

    const startTime = duration > 5 ? 5 : 0;

    return new Promise((resolve, reject) => {
      ffmpeg(absoluteVideoPath)
        .setStartTime(startTime) // Начинаем с 5 секунд или с начала видео, если длительность видео меньше 5 секунд.
        .frames(1) // Извлекаем 1 кадр5
        .size('640x360') // Размер обложки.
        .format('image2') // Формат обложки.
        .output(thumbnailPath) // Куда сохраняем результат.
        .on('end', () => resolve(thumbnailPath)) // Успешное завершение.
        .on('error', (error) =>
          reject(new Error(`Ошибка генерации обложки видео: ${error.message}`))
        ) // Ошибка FFmpeg.
        .run(); // Запускаем FFmpeg.
    });
  },
};

module.exports = videoPreviewService;
