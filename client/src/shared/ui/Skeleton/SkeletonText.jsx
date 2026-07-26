import { Skeleton } from '..';
import styles from './SkeletonText.module.css';

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
