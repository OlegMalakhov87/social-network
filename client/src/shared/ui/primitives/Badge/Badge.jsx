import { classNames } from '../../../utils';

import style from './Badge.module.css';

/**
 * Отображает значок.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое значка
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'} [props.variant='primary'] - Вариант оформления
 * @param {'sm'|'md'} [props.size='md'] - Размер значка
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Значок.
 */

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={classNames(
        style.badge,
        style[variant],
        style[size],
        className
      )}
    >
      {children}
    </span>
  );
};
