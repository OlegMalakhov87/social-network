import { Skeleton } from '..';

export const SkeletonText = ({ rows = 3 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === rows - 1 ? '70%' : '100%'}
        height={16}
        style={{ marginBottom: 8 }}
      />
    ))}
  </>
);
