import { formatTime } from '../../../shared/lib';

/**
 * Подготавливает данные для отображения TrackMeta.
 *
 * @param {Object} track - данные трека
 * @param {string} mode - режим отображения
 */

export const getTrackMeta = (track, mode) => {
  return {
    details: [
      {
        label: 'Исполнитель',
        value: track.artist,
      },
      {
        label: 'Альбом',
        value: track.album,
      },
      {
        label: 'Год',
        value: track.year,
      },
    ],

    dates:
      mode === 'profile'
        ? {
            label: 'Добавлено',
            value: formatTime(track.libraryCreatedAt),
          }
        : {
            label: 'Загружено',
            value: formatTime(track.createdAt),
          },
  };
};
