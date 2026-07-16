import { formatDuration } from '../../../shared/lib';
import { Badge, IconButton, MediaPreview } from '../../../shared/ui';
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
    <div className={style.thumbnail}>
      <MediaPreview
        src={video.thumbnailUrl || video.mediaUrl || '/thumbnail-video.webp'}
        alt={video.title}
      />

      <div className={style.overlay}>
        <IconButton
          icon={playing ? '⏸️' : '▶️'}
          variant="overlay"
          size="lg"
          onClick={() => onPlay?.()}
          ariaLabel={playing ? 'Поставить на паузу' : 'Воспроизвести видео'}
        />

        <Badge size="sm">{formatDuration(video.duration)}</Badge>
      </div>
    </div>
  );
};
