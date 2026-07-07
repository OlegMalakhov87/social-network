import { PostActionsBar } from '..';
import style from './EntityActions.module.css';

/**
 * Универсальный футер карточки.
 *
 * Используется внутри BaseCard.
 *
 * @param {Object} props
 * @param {Array} props.actions
 */

export const EntityActions = ({ actions = [] }) => {
  if (!actions.length) return null;

  return (
    <footer className={style.footer}>
      <PostActionsBar actions={actions} />
    </footer>
  );
};
