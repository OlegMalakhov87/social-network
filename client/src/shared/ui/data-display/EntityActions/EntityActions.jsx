import { ActionsBar } from '../../../ui';
import style from './EntityActions.module.css';

/**
 * Универсальный футер карточки.
 * @param {Object} props
 * @param {Object[]} props.actions - массив действий
 */

export const EntityActions = ({ actions = [] }) => {
  if (!actions.length) return null;

  return (
    <footer className={style.footer}>
      <ActionsBar actions={actions} />
    </footer>
  );
};
