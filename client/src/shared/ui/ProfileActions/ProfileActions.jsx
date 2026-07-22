import { Button } from '..';
import styles from './ProfileActions.module.css';

/**
 * Панель действий профиля.
 *
 * @param {Object} props
 * @param {Array<Object>} props.actions - массив действий (ключ, текст, вариант, disabled, onClick)
 */

export const ProfileActions = ({ actions = [] }) => {
  if (!actions.length) return null;

  return (
    <div className={styles.actions}>
      {actions.map(
        ({
          key,
          text,
          variant = 'primary',
          disabled = false,
          onClick,
        }) => (
          <Button
            key={key}
            fullWidth
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