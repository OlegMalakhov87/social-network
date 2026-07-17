import { Card } from '../Card/Card';
import style from './MediaCardLayout.module.css';

/**
 * Универсальный каркас карточек медиа.
 *
 * Используется:
 * - PostCard
 * - PhotoCard
 * - VideoCard
 * - TrackCard
 *
 * @param {Object} props
 * @param {React.ReactNode} props.header - заголовок карточки
 * @param {React.ReactNode} props.content - контент карточки
 * @param {React.ReactNode} props.actions - действия над карточкой
 * @param {"default"|"outlined"} [props.variant] - вариант карточки (default - обычная, outlined - с рамкой)
 * @param {boolean} [props.fullHeight] - высота карточки
 */

export const MediaCardLayout = ({
  header,
  content,
  actions,
  variant = 'outlined',
  fullHeight = false,
}) => {
  return (
    <Card variant={variant} className={fullHeight ? style.fullHeight : ''}>
      {header && <header className={style.header}>{header}</header>}

      <section className={style.content}>{content}</section>

      {actions && <footer className={style.footer}>{actions}</footer>}
    </Card>
  );
};
