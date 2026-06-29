import style from './PhotoActions.module.css';
import { PostActionsBar } from '../../../../shared/ui';

/**
 * Панель действий карточки фото.
 */

export const PhotoActions = ({ actions }) => {
  return (
    <footer className={style.footer}>
      <PostActionsBar actions={actions} />
    </footer>
  );
};
