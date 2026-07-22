import { Button } from '..';
import styles from './ActionsBar.module.css';

/**
 * Панель действий карточки.
 *
 * @param {Object} props
 * @param {Object[]} props.actions - массив действий
 */
export const ActionsBar = ({ actions = [] }) => {
  return (
    <div className={styles.root}>
      {actions
        .filter((action) => !action.hidden)
        .map((action) => (
          <Button
            key={action.key}
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}
    </div>
  );
};
