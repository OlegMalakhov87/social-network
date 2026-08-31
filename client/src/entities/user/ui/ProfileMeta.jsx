import { Avatar } from '../../../shared/ui';
import { classNames } from '../../../shared/utils';
import styles from './ProfileMeta.module.css';

/**
 * Блок информации о пользователе в шапке профиля.
 * Используется внутри BaseCard / EntityHeader (вертикальная компоновка).
 *
 * @param {Object} props
 * @param {string|React.ReactNode} [props.avatar] - URL или готовый узел аватара
 * @param {string|React.ReactNode} [props.title] - отображаемое имя
 * @param {string|React.ReactNode} [props.subtitle] - подпись перед именем (например, @nickname)
 * @param {React.ReactNode} [props.badge] - содержимое бейджа (строка или компонент Badge)
 * @param {React.ReactNode} [props.extra] - дополнительный блок (кнопки действий и т.п.)
 * @param {'online'|'offline'|'busy'|'away'|null} [props.status] - индикатор на Avatar, если передан URL
 * @param {string} [props.className] - дополнительный класс
 */
export const ProfileMeta = ({
  avatar,
  title,
  subtitle,
  extra,
  status,
  badge,
  className,
}) => {
  return (
    <div className={classNames(styles.root, className)}>
      {avatar && (
        <div className={styles.avatar}>
          {typeof avatar === 'string' ? (
            <Avatar src={avatar} size="xl" alt={title} status={status} />
          ) : (
            avatar
          )}
        </div>
      )}

      {(title || subtitle || badge) && (
        <div className={styles.identity}>
          {(subtitle || title) && (
            <div className={styles.nameRow}>
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
              {title && <h2 className={styles.title}>{title}</h2>}
            </div>
          )}
          {badge && <div className={styles.badges}>{badge}</div>}
        </div>
      )}

      {extra && <div className={styles.extra}>{extra}</div>}
    </div>
  );
};
