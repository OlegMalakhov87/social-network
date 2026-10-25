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
 * Показывает изображение и предварительный просмотр видео после удержания курсора.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.item={}] - Данные медиа
 * @param {Object} [props.currentItem] - Текущее воспроизводимое медиа
 * @param {boolean} [props.isPlaying] - Признак воспроизведения
 * @param {string} props.src - Адрес изображения
 * @param {string} [props.preview] - Адрес предварительного просмотра
 * @param {string} [props.alt] - Альтернативный текст
 * @param {Function} [props.onClick] - Обработчик нажатия
 * @param {string} [props.type='image'] - Тип медиа
 * @param {boolean} [props.clickable=false] - Признак доступности нажатия
 * @param {string} [props.fallback='/no-image-1200x720.png'] - Запасное изображение
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @returns {JSX.Element} Предварительный просмотр медиа.
 */
export const MediaPreview = ({
  item = {},
  currentItem,
  isPlaying,
  src,
  preview,
  alt,
  onClick,
  type = 'image',
  clickable = false,
  fallback = '/no-image-1200x720.png',
  className = '',
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const playing = currentItem?.id === item.id && isPlaying;

  const isVideo = type === 'video';

  // Запускает предварительный просмотр видео после непрерывного удержания курсора в течение заданной задержки.
  useEffect(() => {
    if (!isHovered || !isVideo || disabled || playing) {
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
  }, [isHovered, isVideo, disabled, playing]);

  const showPreviewFallback =
    isVideo && shouldLoadPreview && (!preview || previewError);

  const showVideoPreview =
    isVideo && shouldLoadPreview && Boolean(preview) && !previewError;

  const hideThumbnail = isVideo && (previewLoaded || showPreviewFallback);

  // Сбрасывает ошибку и загрузку предварительного просмотра, когда курсор покидает медиа.
  useEffect(() => {
    if (!isHovered) {
      setPreviewError(false);
      setPreviewLoaded(false);
    }
  }, [isHovered]);

  // Сбрасывает ошибку и загрузку предварительного просмотра при смене его адреса.
  useEffect(() => {
    setPreviewError(false);
    setPreviewLoaded(false);
  }, [preview]);

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
        src={src}
        alt={alt}
        fallback={fallback}
        className={classNames(
          styles.image,
          hideThumbnail && styles.imageHidden
        )}
      />

      {showVideoPreview && (
        <video
          key={preview}
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
          onError={() => {
            setPreviewLoaded(false);
            setPreviewError(true);
          }}
        />
      )}

      {showPreviewFallback && (
        <Image
          src={'/no-preview-1200x720.png'}
          alt="Превью видео недоступно"
          className={classNames(styles.preview, styles.previewVisible)}
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
