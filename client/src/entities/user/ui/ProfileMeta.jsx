import { Avatar } from '../../../shared/ui';
import { classNames } from '../../../shared/utils';

import styles from './ProfileMeta.module.css';

/**
 * Отображает сведения о пользователе в шапке профиля.
 *
 * @param {Object} props - Свойства компонента.
 * @param {string|React.ReactNode} [props.avatar] - URL или узел аватара.
 * @param {string|React.ReactNode} [props.title] - Имя пользователя.
 * @param {string|React.ReactNode} [props.subtitle] - Подпись перед именем.
 * @param {React.ReactNode} [props.extra] - Дополнительный блок.
 * @param {'online'|'offline'|'busy'|'away'|null} [props.status] - Индикатор аватара.
 * @param {React.ReactNode} [props.badge] - Содержимое значка.
 * @param {string} [props.className] - Дополнительный класс CSS.
 * @returns {JSX.Element} Разметка сведений.
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
