import { useState } from 'react';
import { Badge, IconButton, Image } from '../../../ui';
import {
  classNames,
  formatDuration,
  handleKeyboardClick,
} from '../../../utils';
import styles from './MediaPreview.module.css';

/**
 * Универсальное превью медиа.
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
  const playing = currentItem?.id === item.id && isPlaying;
  const showHoverPreview =
    disabled === false && preview && isHovered && !playing;

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
      {showHoverPreview ? (
        <video
          src={preview}
          autoPlay
          muted
          loop
          playsInline
          className={styles.image}
        />
      ) : (
        <Image
          src={src || fallback}
          alt={alt}
          fallback={fallback}
          className={styles.image}
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
