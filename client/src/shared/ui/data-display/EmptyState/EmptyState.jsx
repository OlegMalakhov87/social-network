import { Button } from '../../../ui';

import styles from './EmptyState.module.css';

/**
 * Отображает заглушку при отсутствии данных.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.icon - Иконка заглушки
 * @param {string} props.title - Заголовок сообщения
 * @param {string} [props.description] - Дополнительное описание
 * @param {string} [props.actionLabel] - Текст кнопки действия
 * @param {Function} [props.onAction] - Обработчик нажатия на кнопку
 * @returns {JSX.Element} Заглушка пустого состояния.
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
        <Button size="sm" onClick={onAction} ariaLabel={actionLabel}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
