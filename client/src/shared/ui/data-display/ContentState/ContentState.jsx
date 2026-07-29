import { Alert, Button, ContentEmptyState, PageLoader } from '..';
import style from './ContentState.module.css';

/**
 * Универсальное состояние загрузки контента.
 *
 * Показывает:Loader → Error → Empty → Children
 *
 * @param {Object} props
 * @param {boolean} props.loading - флаг загрузки
 * @param {string|null} props.error - сообщение об ошибке
 * @param {boolean} props.isEmpty - флаг пустого состояния
 * @param {string} props.emptyTitle - заголовок пустого состояния
 * @param {string} props.emptyDescription - описание пустого состояния
 * @param {string} [props.emptyIcon] - иконка пустого состояния
 * @param {string} [props.loadingMessage] - сообщение загрузки
 * @param {Function} [props.onRetry] - функция повтора запроса
 * @param {React.ReactNode} props.children - дочерние элементы
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
  if (loading) {
    return <PageLoader message={loadingMessage} />;
  }

  if (error && isEmpty) {
    return (
      <div className={style.wrapper}>
        <Alert variant="error" title="Не удалось загрузить данные">
          {error}
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
