import PropTypes from 'prop-types';
import { classNames } from '../../lib';
import styles from './Card.module.css';

/**
* Базовый контейнер карточки.

* Отвечает только за внешний вид: фон, границы, скругления, тени, hover и внутренние отступы.
 *
 * Вся структура карточки (Header, Content, Actions и т.д.)
 * строится внутри BaseCard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое карточки.
 * @param {boolean} [props.hover=false] - Добавляет эффект при наведении.
 * @param {boolean} [props.padding=true] - Внутренние отступы.
 * @param {string} [props.className=''] - Дополнительный CSS класс.
 */
export const Card = ({
  children,
  hover = false,
  padding = true,
  className = '',
}) => {
  return (
    <section
      className={classNames(
        styles.card,
        hover && styles.hover,
        padding && styles.padding,
        className
      )}
    >
      {children}
    </section>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
  padding: PropTypes.bool,
  className: PropTypes.string,
};
