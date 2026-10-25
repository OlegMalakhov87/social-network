import { getApiErrorDisplay } from '../../../lib';
import { Alert, Button, ContentEmptyState, PageLoader } from '../../../ui';

import style from './ContentState.module.css';

/**
 * Показывает загрузку, ошибку, пустое состояние или содержимое.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.loading=false] - Признак загрузки
 * @param {Error|Object|string|null} [props.error=null] - Ошибка загрузки
 * @param {boolean} [props.isEmpty=false] - Признак пустого состояния
 * @param {string} [props.emptyTitle] - Заголовок пустого состояния
 * @param {string} [props.emptyDescription] - Описание пустого состояния
 * @param {string} [props.emptyIcon] - Иконка пустого состояния
 * @param {string} [props.loadingMessage='Загрузка...'] - Текст загрузки
 * @param {Function} [props.onRetry] - Обработчик повтора запроса
 * @param {React.ReactNode} props.children - Содержимое после загрузки
 * @returns {React.ReactNode} Загрузка, ошибка, пустое состояние или содержимое.
 */
export const ContentState = ({
  loading = false,
  error = null,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  loadingMessage = 'Загрузка...',
  onRetry,
  children,
}) => {
  const errorMessage =
    error == null
      ? null
      : getApiErrorDisplay(error, 'Не удалось загрузить данные');

  if (loading) {
    return <PageLoader message={loadingMessage} />;
  }

  if (errorMessage && isEmpty) {
    return (
      <div className={style.wrapper}>
        <Alert variant="error" title="Не удалось загрузить данные">
          {errorMessage}
        </Alert>

        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <ContentEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return children;
};
