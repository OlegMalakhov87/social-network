import { classNames } from '../../../utils';
import style from './Checkbox.module.css';

/**
 * Универсальный компонент чекбокса с подписью.
 *
 * @param {Object} props
 * @param {string} props.id - уникальный идентификатор (обязательно для связи с label)
 * @param {React.ReactNode} props.label - текст подписи
 * @param {string} [props.description] - дополнительное описание под заголовком
 * @param {boolean} props.checked - состояние чекбокса
 * @param {Function} props.onChange - обработчик изменения состояния
 * @param {boolean} [props.disabled=false] - заблокирован ли чекбокс
 * @param {'center'|'start'} [props.align='center'] - выравнивание чекбокса относительно подписи
 * @param {string} [props.name] - имя поля формы
 * @param {string} [props.className] - дополнительный CSS-класс
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
