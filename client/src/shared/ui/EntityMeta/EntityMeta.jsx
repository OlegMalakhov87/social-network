import { Avatar, Badge } from '..';
import { classNames } from '../../lib';
import style from './EntityMeta.module.css';

/**
 * Универсальный блок информации о сущности.
 *
 * Используется для: User, Post, Photo, Track, Video, Friend, News
 *
 * Используется внутри BaseCard или EntityHeader.
 *
 * @param {Object} props
 * @param {string} [props.avatar] - изображение аватара
 * @param {string} props.title - заголовок
 * @param {string} [props.subtitle] - подзаголовок
 * @param {string} [props.badge] - бейдж
 * @param {string} [props.className] - класс
 */

export const EntityMeta = ({ avatar, title, subtitle, badge, className }) => {
  return (
    <div className={classNames(style.meta, className)}>
      {avatar && (
        <div className={style.avatar}>
          {typeof avatar === 'string' ? <Avatar src={avatar} /> : avatar}
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
