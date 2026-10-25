import { classNames } from '../../../utils';

import styles from './ButtonGroup.module.css';

/**
 * Выравнивает группу кнопок.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Кнопки группы
 * @param {'start'|'end'|'center'} [props.align='end'] - Выравнивание кнопок
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Группа кнопок.
 */

export const ButtonGroup = ({ children, align = 'end', className }) => {
  return (
    <div className={classNames(styles.group, styles[align], className)}>
      {children}
    </div>
  );
};
