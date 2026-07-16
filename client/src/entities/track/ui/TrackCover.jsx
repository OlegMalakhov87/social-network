import { formatTimeAudio } from '../../../shared/lib';
import { Badge, IconButton, MediaPreview } from '../../../shared/ui';
import style from './TrackCover.module.css';

/**
 * Обложка трека.
 *
 * @param {Object} props
 * @param {Object} props.track
 * @param {Object} props.currentTrack
 * @param {boolean} props.isPlaying
 * @param {Function} props.onPlay
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
