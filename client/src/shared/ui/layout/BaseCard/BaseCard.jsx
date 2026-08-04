import { Card } from '../../../ui';
import { classNames } from '../../../utils';
import style from './BaseCard.module.css';

/**
 * Базовая карточка для отображения контента.
 * @param {Object} props
 * @param {React.ReactNode} [props.header] - заголовок карточки
 * @param {React.ReactNode} [props.cover] - изображение для обложки
 * @param {React.ReactNode} [props.content] - основной контент карточки
 * @param {React.ReactNode} [props.actions] - действия для карточки
 * @param {React.ReactNode} [props.footer] - нижний колонтитул карточки
 * @param {string} [props.className] - дополнительный класс
 * @param {string} [props.variant='outlined'] - вариант карточки
 */

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
    <Card className={classNames(style.card, className)}>
      {header && <header className={style.header}>{header}</header>}

      {cover && <div className={style.cover}>{cover}</div>}

      {content && <section className={style.content}>{content}</section>}

      {actions && <footer className={style.actions}>{actions}</footer>}

      {footer && <div className={style.footer}>{footer}</div>}
    </Card>
  );
};
