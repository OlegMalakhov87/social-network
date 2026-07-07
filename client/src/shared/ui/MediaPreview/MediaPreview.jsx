import { Image } from '..';
import { classNames, handleKeyboardClick } from '../../lib';
import styles from './MediaPreview.module.css';

/**
 * Универсальное превью медиа.
 *
 * @param {Object} props
 * @param {Object} props.item
 * @param {string} props.src
 * @param {string} props.alt
 * @param {Function} props.onClick
 * @param {boolean} props.clickable
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
        fallback="/error.png"
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
