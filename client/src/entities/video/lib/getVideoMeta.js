import { formatDate, formatSize } from '../../../shared/utils';
import { CATEGORY_OPTIONS } from '../model/videosTabs';

/**
 * Возвращает сведения для карточки видео.
 *
 * @param {Object} video - Видео
 * @param {string} mode - Режим отображения
 * @returns {{ details: Array<Object>, dates: Object }} Сведения о видео
 */
export const getVideoMeta = (video, mode) => {
  return {
    details: [
      { label: 'Категория', value: CATEGORY_OPTIONS.find(option => option.value === video.category)?.label },
      { label: 'Размер', value: formatSize(video.size) },
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
