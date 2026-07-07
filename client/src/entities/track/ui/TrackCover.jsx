import { formatTimeAudio } from '../../../../shared/lib';
import { Badge, MediaPreview } from '../../../../shared/ui';
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
    <div
      className={style.cover}
      onClick={() => onPlay?.()}
      role="button"
      tabIndex={0}
    >
      <MediaPreview
        src={`https://picsum.photos/320/180?random=${track.id}`}
        alt={track.title}
      />

      <div className={style.overlay}>
        <span className={style.play}>{playing ? '⏸️' : '▶️'}</span>

        <Badge size="sm">{formatTimeAudio(track.duration)}</Badge>
      </div>
    </div>
  );
};
