import { formatTimeAudio } from '../../../shared/lib';
import { Badge, IconButton, MediaPreview } from '../../../shared/ui';
import style from './TrackCover.module.css';

/**
 * Обложка трека.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} props.track - данные трека
 * @param {Object} props.currentTrack - данные текущего трека
 * @param {boolean} props.isPlaying - проигрывается ли трек сейчас
 * @param {Function} props.onPlay - функция для воспроизведения трека
 */

export const TrackCover = ({ track, currentTrack, isPlaying, onPlay }) => {
  const playing = currentTrack?.id === track.id && isPlaying;

  return (
    <div className={style.cover}>
      <MediaPreview
        src={track.coverUrl || track.mediaUrl || '/cover-track.webp'}
        alt={track.title}
      />

      <div className={style.overlay}>
        <IconButton
          icon={playing ? '⏸️' : '▶️'}
          variant="overlay"
          size="lg"
          onClick={() => onPlay?.()}
          ariaLabel={playing ? 'Поставить на паузу' : 'Воспроизвести трек'}
        />

        <Badge size="sm">{formatTimeAudio(track.duration)}</Badge>
      </div>
    </div>
  );
};
