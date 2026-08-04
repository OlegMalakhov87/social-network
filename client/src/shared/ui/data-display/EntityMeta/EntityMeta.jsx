import { Avatar, Badge } from '../../../ui';
import { classNames } from '../../../utils';
import style from './EntityMeta.module.css';

/**
 * Универсальный блок информации о сущности.
 * Используется внутри BaseCard или EntityHeader для отображения информации о сущности.
 *
 * @param {Object} props
 * @param {string|React.ReactNode} [props.avatar] - изображение аватара
 * @param {string} [props.title] - заголовок (необязательно)
 * @param {string} [props.subtitle] - подзаголовок (необязательно)
 * @param {string} [props.badge] - бейдж (необязательно)
 * @param {string} [props.className] - дополнительный класс
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
