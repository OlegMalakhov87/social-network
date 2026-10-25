import { IconButton } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './ScrollNavigationButton.module.css';

/**
 * Прокручивает к началу или к форме.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isPastMiddle - Признак прокрутки ниже середины
 * @param {Function} props.scrollToTop - Обработчик прокрутки к началу
 * @param {Function} props.scrollToBottom - Обработчик прокрутки к форме
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Кнопка прокрутки.
 */
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
