import styles from './UserMeta.module.css';
import { Avatar } from '..';

/**
 * Блок информации о пользователе.
 *
 * Используется:
 * - PostCard
 * - CommentCard
 * - VideoCard
 * - PhotoCard
 * * - MessageBubble
 *
 * @param {Object} props
 * @param {string} props.avatar
 * @param {string} props.name
 * @param {string} props.subtitle
 * @param {React.ReactNode} props.extra
 * @param {'sm'|'md'|'lg'} [props.avatarSize='md']
 */
export const UserMeta = ({
  avatar,
  name,
  subtitle,
  extra,
  avatarSize = 'md',
}) => {
  return (
    <div className={styles.root}>
      <Avatar src={avatar} size={avatarSize} alt={name} />

      <div className={styles.content}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>

          {extra}
        </div>

        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
};
