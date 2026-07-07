import { formatDuration } from '../../../../shared/lib';
import { Badge, MediaPreview } from '../../../../shared/ui';
import style from './VideoThumbnail.module.css';

/**
 * Обложка видео.
 *
 * @param {Object} props
 * @param {Object} props.video
 * @param {boolean} props.isPlaying
 * @param {Object} props.currentVideo
 * @param {Function} props.onPlay
 */

export const VideoThumbnail = ({ video, isPlaying, currentVideo, onPlay }) => {
  const playing = currentVideo?.id === video.id && isPlaying;
  return (
    <div
      className={style.thumbnail}
      onClick={() => onPlay?.()}
      role="button"
      tabIndex={0}
    >
      <MediaPreview src={video.thumbnail} alt={video.title} />

      <div className={style.overlay}>
        <span className={style.play}>{playing ? '⏸️' : '▶️'}</span>

        <Badge size="sm">{formatDuration(video.duration)}</Badge>
      </div>
    </div>
  );
};
