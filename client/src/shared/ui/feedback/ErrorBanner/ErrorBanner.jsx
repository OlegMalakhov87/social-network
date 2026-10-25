import { Alert, Button } from '../../../ui';
import { classNames } from '../../../utils';

import style from './ErrorBanner.module.css';

/**
 * Отображает ошибку и кнопку повтора.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.title='Ошибка загрузки'] - Заголовок ошибки
 * @param {string} [props.message] - Текст ошибки
 * @param {Function} [props.onRetry] - Обработчик повтора запроса
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Сообщение об ошибке.
 */
export const ErrorBanner = ({
  title = 'Ошибка загрузки',
  message,
  onRetry,
  className,
}) => {
  return (
    <div className={classNames(style.banner, className)}>
      <Alert variant="error" title={title}>
        {message ||
          'Не удалось получить данные. Проверьте соединение и попробуйте снова.'}
      </Alert>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className={style.retryButton}
        >
          Повторить попытку
        </Button>
      )}
    </div>
  );
};
