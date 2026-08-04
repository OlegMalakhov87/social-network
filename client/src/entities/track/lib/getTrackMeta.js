import { formatDate } from '../../../shared/utils';

/**
 * Подготавливает данные для отображения TrackMeta.
 *
 * @param {Object} track - данные трека
 * @param {string} mode - режим отображения
 */
export const getTrackMeta = (track, mode) => {
  return {
    details: [
      { label: 'Исполнитель', value: track.artist },
      { label: 'Альбом', value: track.album },
      { label: 'Год', value: track.year },
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
