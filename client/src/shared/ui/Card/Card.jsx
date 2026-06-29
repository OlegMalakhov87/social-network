import PropTypes from 'prop-types';
import styles from './Card.module.css';

/**
 * Универсальная карточка приложения.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое карточки.
 * @param {React.ReactNode} [props.header] - Верхняя часть карточки.
 * @param {React.ReactNode} [props.footer] - Нижняя часть карточки.
 * @param {boolean} [props.hover=false] - Добавляет эффект при наведении.
 * @param {boolean} [props.padding=true] - Внутренние отступы.
 * @param {string} [props.className=''] - Дополнительный CSS класс.
 */
export const Card = ({
  children,
  header,
  footer,
  hover = false,
  padding = true,
  className = '',
}) => {
  return (
    <section
      className={[
        styles.card,
        hover && styles.hover,
        padding && styles.padding,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.body}>{children}</div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  hover: PropTypes.bool,
  padding: PropTypes.bool,
  className: PropTypes.string,
};
