import { Image } from '../..';
import { classNames, handleKeyboardClick } from '../../../utils';

import styles from './Avatar.module.css';

/**
 * Отображает аватар пользователя и индикатор присутствия.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.src - Адрес изображения
 * @param {string} [props.fallback='/user.jpg'] - Запасное изображение
 * @param {string} [props.alt='Аватар'] - Альтернативный текст
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Размер аватара
 * @param {'circle'|'rounded'|'square'} [props.variant='circle'] - Форма аватара
 * @param {'online'|'offline'|'busy'|'away'|null} [props.status=null] - Присутствие: в сети, не в сети, занят или отошёл
 * @param {boolean} [props.clickable=false] - Признак доступности нажатия
 * @param {Function} [props.onClick=() => {}] - Обработчик нажатия
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Разметка аватара.
 */
export const Avatar = ({
  src,
  fallback = '/user.jpg',
  alt = 'Аватар',
  size = 'md',
  variant = 'circle',
  status = null,
  clickable = false,
  onClick = () => {},
  className = '',
}) => {
  return (
    <div className={styles.avatarWrapper}>
      <div
        className={classNames(
          styles.avatar,
          styles[size],
          styles[variant],
          clickable && styles.clickable,
          className
        )}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable ? (e) => handleKeyboardClick(e, onClick) : undefined
        }
      >
        <Image
          src={src || fallback}
          fallback={fallback}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={styles.image}
        />
      </div>
      {status && <span className={classNames(styles.status, styles[status])} />}
    </div>
  );
};
