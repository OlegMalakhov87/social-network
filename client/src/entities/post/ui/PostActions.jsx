import style from './PostActions.module.css';
import { PostActionsBar } from '../../../../shared/ui';

/**
 * Панель действий карточки поста.
 */

export const PostActions = ({ actions }) => {
  return (
    <footer className={style.footer}>
      <PostActionsBar actions={actions} />
    </footer>
  );
};
