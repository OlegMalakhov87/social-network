import style from './MediaCardLayout.module.css';
import { Card } from '../Card/Card';

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
 * @param {React.ReactNode} props.header
 * @param {React.ReactNode} props.content
 * @param {React.ReactNode} props.actions
 * @param {"default"|"outlined"} [props.variant]
 * @param {boolean} [props.fullHeight]
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
