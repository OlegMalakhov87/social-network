import { Avatar } from '../../../ui';
import { classNames } from '../../../utils';
import style from './EntityMeta.module.css';

/**
 * Универсальный блок информации о сущности.
 * Используется внутри BaseCard или EntityHeader для отображения информации о сущности.
 *
 * @param {Object} props
 * @param {string|React.ReactNode} [props.avatar] - изображение аватара
 * @param {string|React.ReactNode} [props.title] - заголовок
 * @param {string|React.ReactNode} [props.subtitle] - подзаголовок
 * @param {string|React.ReactNode} [props.badge] - текст или узел бейджа
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

      {(title || subtitle || badge) && (
        <div className={style.info}>
          {title && <h3 className={style.title}>{title}</h3>}
          {subtitle && <div className={style.subtitle}>{subtitle}</div>}
          {badge && <div className={style.badges}>{badge}</div>}
        </div>
      )}
    </div>
  );
};
