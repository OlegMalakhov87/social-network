import { Card } from '../../../ui';
import { classNames } from '../../../utils';

import style from './BaseCard.module.css';

/**
 * Собирает карточку из заголовка, обложки и содержимого.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} [props.header] - Заголовок карточки
 * @param {React.ReactNode} [props.cover] - Обложка карточки
 * @param {React.ReactNode} [props.content] - Основное содержимое
 * @param {React.ReactNode} [props.actions] - Действия карточки
 * @param {React.ReactNode} [props.footer] - Нижняя часть карточки
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @param {string} [props.variant='outlined'] - Вариант оформления
 * @returns {JSX.Element} Карточка.
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
