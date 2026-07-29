import styles from './Skeleton.module.css';
import { classNames } from '../../lib';

/**
 * Универсальный Skeleton для отображения состояния загрузки.
 *
 * @param {Object} props
 * @param {string|number} [props.width='100%'] - ширина
 * @param {string|number} [props.height=16] - высота
 * @param {boolean} [props.circle=false] - круглая форма
 * @param {string|number} [props.radius] - переопределить border-radius
 * @param {string} [props.className=''] - дополнительный CSS класс
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
