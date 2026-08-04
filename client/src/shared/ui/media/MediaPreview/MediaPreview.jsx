import { Image } from '../../../ui';
import { classNames, handleKeyboardClick } from '../../../utils';
import styles from './MediaPreview.module.css';

/**
 * Универсальное превью медиа.
 *
 * @param {Object} props
 * @param {Object} props.item - объект с данными о медиа
 * @param {string} props.src - URL изображения
 * @param {string} props.alt - альтернативный текст изображения
 * @param {Function} props.onClick - функция, вызываемая при клике
 * @param {boolean} props.clickable - если true, то превью является кликабельным
 */
export const MediaPreview = ({
  item = {},
  src,
  alt,
  onClick,
  clickable = item.type === 'video',
}) => {
  return (
    <div
      className={classNames(styles.wrapper, clickable && styles.clickable)}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => handleKeyboardClick(e, onClick) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fallback="/error-page.png"
        className={styles.image}
      />

      {clickable && (
        <div className={styles.overlay}>
          <span className={styles.play}>▶</span>
        </div>
      )}
    </div>
  );
};
