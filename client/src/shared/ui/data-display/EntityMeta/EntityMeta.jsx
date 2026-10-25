import { Avatar } from '../../../ui';
import { classNames } from '../../../utils';

import style from './EntityMeta.module.css';

/**
 * Отображает краткие сведения о сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {string|React.ReactNode} [props.avatar] - Адрес или узел аватара
 * @param {string|React.ReactNode} [props.title] - Заголовок
 * @param {string|React.ReactNode} [props.subtitle] - Подзаголовок
 * @param {string|React.ReactNode} [props.badge] - Содержимое значка
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Краткие сведения.
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
