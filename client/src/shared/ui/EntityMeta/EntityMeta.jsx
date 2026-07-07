import { Avatar, Badge } from '..';
import { classNames } from '../../lib';
import style from './EntityMeta.module.css';

/**
 * Универсальный блок информации о сущности.
 *
 * Используется для:
 *
 * User
 * Post
 * Photo
 * Track
 * Video
 * Playlist
 * Album
 * Friend
 *
 * внутри BaseCard или EntityHeader.
 *
 * @param {Object} props
 * @param {string} [props.avatar]
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.badge]
 * @param {string} [props.className]
 */

export const EntityMeta = ({ avatar, title, subtitle, badge, className }) => {
  return (
    <div className={classNames(style.meta, className)}>
      {avatar && (
        <div className={style.avatar}>
          <Avatar src={avatar} size="md" />
        </div>
      )}

      <div className={style.info}>
        <div className={style.row}>
          <h3 className={style.title}>{title}</h3>

          {badge && <Badge size="sm">{badge}</Badge>}
        </div>

        {subtitle && <div className={style.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};
