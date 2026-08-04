import { Button } from '../../../ui';
import styles from './EmptyState.module.css';

/**
 * Заглушка для пустого состояния (нет данных, ничего не найдено).
 * @param {Object} props
 * @param {string} props.icon - эмодзи или символ иконки
 * @param {string} props.title - заголовок сообщения
 * @param {string} [props.description] - дополнительный текст описания
 * @param {string} [props.actionLabel] - текст кнопки действия (если нужно предложить действие)
 * @param {Function} [props.onAction] - обработчик клика по кнопке
 */
export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className={styles.emptyContent} role="status">
      <div className={styles.emptyIcon} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.emptyTitle}>{title}</div>
      {description && <div className={styles.emptyText}>{description}</div>}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
