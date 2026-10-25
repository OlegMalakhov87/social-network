import { formatDate, formatSize } from '../../../shared/utils';

/**
 * Возвращает сведения для карточки трека.
 *
 * @param {Object} track - Трек
 * @param {string} mode - Режим отображения
 * @returns {{ details: Array<Object>, dates: Object }} Сведения о треке
 */
export const getTrackMeta = (track, mode) => {
  return {
    details: [
      { label: 'Исполнитель', value: track.artist },
      { label: 'Альбом', value: track.album || 'Не указан' },
      { label: 'Размер', value: formatSize(track.size) },
    ],

    dates:
      mode === 'profile'
        ? {
            label: 'Добавлено',
            value: formatDate(track.libraryCreatedAt),
          }
        : {
            label: 'Загружено',
            value: formatDate(track.createdAt),
          },
  };
};
