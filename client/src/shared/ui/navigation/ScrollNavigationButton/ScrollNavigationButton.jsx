import { IconButton } from '../../../ui';
import { classNames } from '../../../utils';
import styles from './ScrollNavigationButton.module.css';

export const ScrollNavigationButton = ({
  isPastMiddle,
  scrollToTop,
  scrollToBottom,
  className = '',
}) => {
  const handleClick = isPastMiddle ? scrollToTop : scrollToBottom;

  return (
    <div className={classNames(styles.container, className)}>
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
