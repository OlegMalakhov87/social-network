import { formatTime } from '../../../shared/lib';

/**
 * Подготавливает данные для отображения VideoMeta.
 *
 * @param {Object} video - данные видео
 * @param {string} mode - режим отображения
 * @returns {Object} - данные для отображения VideoMeta
 */

export const getVideoMeta = (video, mode) => {
  return {
    details: [
      {
        label: 'Категория',
        value: video.category,
      },
      {
        label: 'Размер',
        value: video.size,
      },
      {
        label: 'Год',
        value: video.year,
      },
    ],

    dates:
      mode === 'profile'
        ? {
            label: 'Добавлено',
            value: formatTime(video.libraryCreatedAt),
            secondaryLabel: video.lastWatchedAt
              ? 'Последний просмотр'
              : undefined,
            secondaryValue: video.lastWatchedAt
              ? formatTime(video.lastWatchedAt)
              : undefined,
          }
        : {
            label: 'Загружено',
            value: formatTime(video.createdAt),
          },
  };
};
