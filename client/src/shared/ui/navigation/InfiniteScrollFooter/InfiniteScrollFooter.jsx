import { Button, Loading } from '../..';
import { classNames } from '../../../lib';
import style from './InfiniteScrollFooter.module.css';

/**
 * Универсальный футер для бесконечного скролла.
 * Автоматически отображает: лоадер, ошибку с кнопкой повтора или сообщение о конце списка.
 *
 * @param {Object} props
 * @param {boolean} props.hasMore - Есть ли еще данные для загрузки
 * @param {boolean} props.isLoading - Идет ли сейчас загрузка следующей страницы
 * @param {string|null} props.error - Текст ошибки при дозагрузке
 * @param {Function} props.onRetry - Функция повтора загрузки при ошибке
 * @param {string} [props.endMessage='Вы просмотрели все данные'] - Текст при окончании списка
 * @param {string} [props.className] - Дополнительный CSS-класс
 */
export const InfiniteScrollFooter = ({
  hasMore,
  isLoading,
  error,
  onRetry,
  endMessage = 'Вы просмотрели все данные',
  className,
}) => {
  //  Ошибка при дозагрузке
  if (error) {
    return (
      <div className={classNames(style.footer, style.error, className)}>
        <span className={style.text}>Не удалось загрузить ещё</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </div>
    );
  }

  // Идет загрузка следующей страницы
  if (isLoading) {
    return (
      <div className={classNames(style.footer, className)}>
        <Loading size="small" message="Загружаем ещё..." />
      </div>
    );
  }

  //  Данные закончились
  if (!hasMore) {
    return (
      <div className={classNames(style.footer, style.end, className)}>
        <span className={style.badge}>{endMessage}</span>
      </div>
    );
  }

  //  Есть данные, загрузка не идет, ждем скролла (ничего не показываем)
  return null;
};
