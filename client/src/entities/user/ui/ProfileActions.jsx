import { Button } from '../../../shared/ui';
import styles from './ProfileActions.module.css';

/**
 * Панель действий профиля.
 *
 * @param {Object} props
 * @param {Array<Object>} props.actions - массив действий
 */

export const ProfileActions = ({ actions = [] }) => {
  if (!actions.length) return null;

  return (
    <div className={styles.actions}>
      {actions.map(
        ({
          key,
          text,
          hoverText,
          variant = 'primary',
          disabled = false,
          onClick,
        }) => (
          <Button
            key={key}
            fullWidth
            hoverText={hoverText}
            variant={variant}
            disabled={disabled}
            onClick={onClick}
          >
            {text}
          </Button>
        )
      )}
    </div>
  );
};
