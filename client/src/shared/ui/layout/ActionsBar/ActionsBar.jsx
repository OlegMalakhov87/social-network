import { Button } from '../..';

import styles from './ActionsBar.module.css';

/**
 * Отображает ряд кнопок действий.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object[]} [props.actions=[]] - Действия с ключом, подписью, обработчиком и иконкой
 * @returns {JSX.Element} Ряд кнопок.
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
