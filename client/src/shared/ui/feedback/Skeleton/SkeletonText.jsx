import { Skeleton } from '../..';

import styles from './SkeletonText.module.css';

/**
 * Отображает каркас загрузки из нескольких строк.
 *
 * @param {Object} props - Свойства компонента
 * @param {number} [props.rows=3] - Количество строк
 * @returns {JSX.Element} Строки каркаса загрузки.
 */
export const SkeletonText = ({ rows = 3 }) => (
  <div className={styles.wrapper}>
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === rows - 1 ? '70%' : '100%'}
        height={16}
      />
    ))}
  </div>
);
