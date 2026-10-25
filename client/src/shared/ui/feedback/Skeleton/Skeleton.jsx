import { classNames } from '../../../utils';

import styles from './Skeleton.module.css';

/**
 * Отображает каркас загрузки.
 *
 * @param {Object} props - Свойства компонента
 * @param {string|number} [props.width='100%'] - Ширина
 * @param {string|number} [props.height=16] - Высота
 * @param {boolean} [props.circle=false] - Круглая форма
 * @param {string|number} [props.radius] - Радиус скругления
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {Object} [props.style] - Дополнительные стили элемента
 * @returns {JSX.Element} Каркас загрузки.
 */
export const Skeleton = ({
  width = '100%',
  height = 16,
  circle = false,
  radius,
  className = '',
  style,
}) => {
  return (
    <div
      className={classNames(
        styles.skeleton,
        circle && styles.circle,
        className
      )}
      style={{
        width,
        height,
        borderRadius: radius ?? undefined,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};
