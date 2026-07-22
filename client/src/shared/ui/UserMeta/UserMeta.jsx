import styles from './UserMeta.module.css';
import { Avatar } from '..';

/**
 * Блок информации о пользователе.
 * Используется внутри BaseCard или EntityHeader для отображения информации о пользователе.
 * 
  * @param {Object} props
 * @param {string} props.avatar - URL изображения аватара
 * @param {string} props.name - имя пользователя (заголовок)
 * @param {string} [props.subtitle] - подзаголовок
 * @param {React.ReactNode} props.extra - дополнительное содержимое (кнопки, ссылки, etc.)
 * @param {'sm'|'md'|'lg'} [props.avatarSize='md'] - размер аватара (по умолчанию 'md')
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
