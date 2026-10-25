import { classNames } from '../../../utils';

import style from './Checkbox.module.css';

/**
 * Отображает флажок с подписью.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.id - Идентификатор для связи с подписью
 * @param {React.ReactNode} props.label - Текст подписи
 * @param {string} [props.description] - Дополнительное описание под заголовком
 * @param {boolean} props.checked - Признак выбранного флажка
 * @param {Function} props.onChange - Обработчик изменения
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {'center'|'start'|'end'} [props.align='center'] - Выравнивание флажка относительно подписи
 * @param {string} [props.name] - Имя поля формы
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Флажок с подписью.
 */
export const Checkbox = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  align = 'center',
  name,
  className,
}) => {
  return (
    <div
      className={classNames(
        style.wrapper,
        align === 'start' && style.alignStart,
        align === 'end' && style.alignEnd,
        disabled && style.disabled,
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={style.input}
      />
      <label htmlFor={id} className={style.label}>
        {description ? (
          <span className={style.labelContent}>
            <span className={style.labelTitle}>{label}</span>
            <span className={style.labelDescription}>{description}</span>
          </span>
        ) : (
          label
        )}
      </label>
    </div>
  );
};
