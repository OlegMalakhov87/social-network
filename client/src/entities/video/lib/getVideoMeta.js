import { formatDate, formatSize } from '../../../shared/utils';
import { CATEGORY_OPTIONS } from '../model/videosTabs';

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
      { label: 'Категория', value: CATEGORY_OPTIONS.find(option => option.value === video.category)?.label },
      { label: 'Размер', value: formatSize(video.size) },
      { label: 'Год', value: video.year },
    ],

    dates:
      mode === 'profile'
        ? {
            label: 'Добавлено',
            value: formatDate(video.libraryCreatedAt),
            secondaryLabel: video.lastWatchedAt
              ? 'Последний просмотр'
              : undefined,
            secondaryValue: video.lastWatchedAt
              ? formatDate(video.lastWatchedAt)
              : undefined,
          }
        : {
            label: 'Загружено',
            value: formatDate(video.createdAt),
          },
  };
};
