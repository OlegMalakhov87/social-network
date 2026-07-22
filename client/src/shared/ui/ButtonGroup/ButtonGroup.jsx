import { classNames } from '../../lib';
import styles from './ButtonGroup.module.css';

/**
 * Контейнер для группы кнопок.
 *
 * @param {Object} props - параметры запроса
 * @param {React.ReactNode} props.children - контент кнопок
 * @param {'start'|'end'|'center'} [props.align='end'] - выравнивание кнопок
 * @param {string} [props.className] - дополнительный класс
 */

export const ButtonGroup = ({
  children,
  align = 'end',
  className,
}) => {
  return (
    <div
      className={classNames(
        styles.group,
        styles[align],
        className
      )}
    >
      {children}
    </div>
  );
};