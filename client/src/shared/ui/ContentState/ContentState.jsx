import style from './ContentState.module.css';
import { Alert, PageLoader, Button, ContentEmptyState } from '..';

/**
 * Универсальное состояние загрузки контента.
 *
 * Показывает:
 * Loader → Error → Empty → Children
 *
 * @param {Object} props
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {boolean} props.isEmpty
 * @param {string} props.emptyTitle
 * @param {string} props.emptyDescription
 * @param {string} [props.emptyIcon]
 * @param {string} [props.loadingMessage]
 * @param {Function} [props.onRetry]
 * @param {React.ReactNode} props.children
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

  if (error) {
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
