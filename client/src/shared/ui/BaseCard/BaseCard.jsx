import { Card } from '..';
import { classNames } from '../../lib';
import style from './BaseCard.module.css';

export const BaseCard = ({
  header,
  cover,
  content,
  actions,
  footer,
  className,
  variant = 'outlined',
}) => {
  return (
    <Card variant={variant} className={classNames(style.card, className)}>
      {header && <header className={style.header}>{header}</header>}

      {cover && <div className={style.cover}>{cover}</div>}

      {content && <section className={style.content}>{content}</section>}

      {actions && <footer className={style.actions}>{actions}</footer>}

      {footer && <div className={style.footer}>{footer}</div>}
    </Card>
  );
};
