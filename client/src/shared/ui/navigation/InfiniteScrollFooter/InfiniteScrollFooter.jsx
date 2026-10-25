import { Button, Loading } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './InfiniteScrollFooter.module.css';

/**
 * Отображает индикатор загрузки, ошибку с кнопкой повтора или сообщение о конце списка.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.hasMore - Признак оставшихся данных
 * @param {boolean} props.isLoading - Признак загрузки следующей страницы
 * @param {string|null} props.error - Текст ошибки дозагрузки
 * @param {Function} [props.onRetry] - Обработчик повтора загрузки
 * @param {string} [props.endMessage='Вы просмотрели все данные'] - Текст в конце списка
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element|null} Состояние подгрузки или пустой результат.
 */
export const InfiniteScrollFooter = ({
  hasMore,
  isLoading,
  error,
  onRetry,
  endMessage = 'Вы просмотрели все данные',
  className,
}) => {
  if (error) {
    return (
      <div className={classNames(styles.footer, styles.error, className)}>
        <span className={styles.text}>Не удалось загрузить ещё</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={classNames(styles.footer, className)}>
        <Loading size="small" message="Загружаем ещё..." />
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className={classNames(styles.footer, styles.end, className)}>
        <span className={styles.badge}>{endMessage}</span>
      </div>
    );
  }

  // Ожидает прокрутку и ничего не показывает, пока данные ещё есть и загрузка не идёт.
  return null;
};
