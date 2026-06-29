import styles from './Avatar.module.css';
import { classNames } from '../../lib';
import { Image } from '..';

/**
 * Универсальный компонент аватара пользователя.
 *
 * @param {Object} props
 * @param {string} props.src - URL изображения.
 * @param {string} [props.fallback='/images/avatar-placeholder.webp'] - Запасное изображение.
 * @param {string} [props.alt='Avatar'] - Альтернативный текст.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Размер аватара.
 * @param {'circle'|'rounded'|'square'} [props.variant='circle'] - Форма.
 * @param {'online'|'offline'|'busy'|'away'|null} [props.status=null] - Статус пользователя.
 * @param {boolean} [props.clickable=false] - Делает аватар кликабельным.
 * @param {Function} [props.onClick] - Обработчик клика.
 * @param {string} [props.className] - Дополнительный CSS-класс.
 */
export const Avatar = ({
  src,
  fallback = '/images/avatar-placeholder.webp',
  alt = 'Avatar',
  size = 'md',
  variant = 'circle',
  status = null,
  clickable = false,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={classNames(
        styles.avatar,
        styles[size],
        styles[variant],
        clickable && styles.clickable,
        className
      )}
      onClick={onClick}
    >
      <Image
        src={src}
        fallback={fallback}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={styles.image}
      />

      {status && <span className={classNames(styles.status, styles[status])} />}
    </div>
  );
};
