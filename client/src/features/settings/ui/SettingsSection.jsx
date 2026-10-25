import { Text } from '../../../shared/ui';
import { classNames } from '../../../shared/utils';

import style from './SettingsForm.module.css';

/**
 * Отображает секцию настроек с заголовком и содержимым.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок секции
 * @param {React.ReactNode} props.children - Содержимое секции
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Секция настроек
 */
export const SettingsSection = ({ title, children, className = '' }) => {
  return (
    <div className={classNames(style.formWrapper, className)}>
      <Text variant="h3" className={style.sectionTitle}>
        {title}
      </Text>
      {children}
    </div>
  );
};
