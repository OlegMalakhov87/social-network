import style from './PostHeader.module.css';
import { UserMeta } from '../../../../shared/ui';

/**
 * Шапка карточки поста.
 *
 * @param {Object} props
 * @param {Object} props.user
 * @param {string} props.createdAt
 */

export const PostHeader = ({ user, createdAt }) => {
  return (
    <header className={style.header}>
      <UserMeta
        avatar={user.photoUrl}
        name={user.name}
        subtitle={createdAt}
        avatarSize="md"
      />
    </header>
  );
};
