import { Text } from '../../../shared/ui';
import { classNames } from '../../../shared/utils';
import style from './SettingsForm.module.css';

/**
 * Обёртка секции настроек: заголовок + контент.
 * 
 * @param {Object} props
 * @param {string} props.title - заголовок секции
 * @param {React.ReactNode} props.children - контент секции
 * @param {string} [props.className=''] - дополнительный класс
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
