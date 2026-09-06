import { useEffect, useState } from 'react';
import { Badge, IconButton, Image } from '../../../ui';
import {
  classNames,
  formatDuration,
  handleKeyboardClick,
} from '../../../utils';
import styles from './MediaPreview.module.css';

const PREVIEW_DELAY = 1000;

/**
 * Универсальное превью медиа.
 *
 * Preview видео запускается только после того,
 * как пользователь непрерывно удерживает курсор
 * над медиа в течение PREVIEW_DELAY.
 *
 * @param {Object} props
 * @param {Object} [props.item] - объект с данными о медиа
 * @param {string} props.src - URL изображения
 * @param {string} [props.preview] - URL превью
 * @param {string} props.alt - альтернативный текст изображения
 * @param {Object} [props.currentItem] - объект с данными о текущем медиа
 * @param {boolean} [props.isPlaying] - если true, то превью воспроизводится
 * @param {Function} [props.onClick] - функция, вызываемая при клике
 * @param {boolean} [props.clickable] - если true, то превью является кликабельным
 * @param {string} [props.fallback] - URL изображения-заглушки
 * @param {string} [props.className] - класс для обертки
 * @param {boolean} [props.disabled] - если true, то превью является некликабельным
 */
export const MediaPreview = ({
  item = {},
  currentItem,
  isPlaying,
  src,
  preview,
  alt,
  onClick,
  clickable = item.type === 'video',
  fallback = '/default-image.jpg',
  className = '',
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const playing = currentItem?.id === item.id && isPlaying;

  useEffect(() => {
    if (!isHovered || !preview || disabled || playing) {
      setShouldLoadPreview(false);
      setPreviewLoaded(false);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setShouldLoadPreview(true);
    }, PREVIEW_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHovered, preview, disabled, playing]);

  useEffect(() => {
    if (!isHovered) {
      setPreviewError(false);
      setPreviewLoaded(false);
    }
  }, [isHovered]);

  return (
    <div
      className={classNames(
        styles.wrapper,
        clickable && styles.clickable,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={clickable ? (e) => handleKeyboardClick(e, onClick) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <Image
        src={src || fallback}
        alt={alt}
        fallback={fallback}
        className={classNames(
          styles.image,
          previewLoaded && styles.imageHidden
        )}
      />

      {shouldLoadPreview && !previewError && (
        <video
          src={preview}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={classNames(
            styles.preview,
            previewLoaded && styles.previewVisible
          )}
          onLoadedData={() => setPreviewLoaded(true)}
          onError={() => setPreviewError(true)}
        />
      )}

      {clickable && (
        <div className={styles.overlay}>
          <IconButton
            icon={playing ? '⏸️' : '▶️'}
            variant="overlay"
            size="lg"
            ariaLabel={playing ? 'Поставить на паузу' : 'Воспроизвести'}
            onClick={disabled ? undefined : () => onClick?.(item)}
            disabled={disabled}
          />

          {item.duration && (
            <Badge size="sm" className={styles.badge}>
              {formatDuration(item.duration)}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
