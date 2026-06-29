import styles from './MediaPreview.module.css';
import { Image } from '../Image/Image';

/**
 * Универсальное превью медиа.
 *
 * @param {Object} props
 * @param {'image'|'video'} props.type
 * @param {string} props.src
 * @param {string} props.alt
 * @param {Function} props.onClick
 * @param {boolean} props.clickable
 */
export const MediaPreview = ({
  type = 'image',
  src,
  alt,
  onClick,
  clickable = false,
}) => {
  return (
    <div
      className={`${styles.wrapper} ${clickable ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fallback="/error.png"
        className={styles.image}
      />

      {type === 'video' && (
        <div className={styles.overlay}>
          <span className={styles.play}>▶</span>
        </div>
      )}
    </div>
  );
};
