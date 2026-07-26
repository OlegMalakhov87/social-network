import { formatTime } from '../../../shared/lib';
import { Badge, IconButton, MediaPreview } from '../../../shared/ui';
import style from './VideoThumbnail.module.css';

/**
 * Обложка видео.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} props.video - данные видео
 * @param {boolean} props.isPlaying - флаг проигрывается видео true/false
 * @param {Object} props.currentVideo - данные текущего видео
 * @param {Function} props.onPlay - функция для воспроизведения видео
 * @returns {React.ReactNode} - компонент VideoThumbnail
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

        <Badge size="sm">{formatTime(video.duration)}</Badge>
      </div>
    </div>
  );
};
