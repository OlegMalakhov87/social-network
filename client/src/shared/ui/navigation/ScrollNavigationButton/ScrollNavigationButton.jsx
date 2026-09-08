import { IconButton } from '../../../ui';
import styles from './ScrollNavigationButton.module.css';

export const ScrollNavigationButton = ({
  isPastMiddle,
  scrollToTop,
  scrollToBottom,
}) => {
  const handleClick = isPastMiddle ? scrollToTop : scrollToBottom;

  return (
    <div className={styles.container}>
      <IconButton
        icon={isPastMiddle ? '↑' : '↓'}
        onClick={handleClick}
        ariaLabel={
          isPastMiddle
            ? 'Перейти к началу комментариев'
            : 'Перейти к форме комментария'
        }
        size="sm"
        variant="primary"
      />
    </div>
  );
};
