import { classNames } from '../../lib';
import style from './Checkbox.module.css';

/**
 * Универсальный компонент чекбокса с подписью.
 *
 * @param {Object} props
 * @param {string} props.id - уникальный идентификатор (обязательно для связи с label)
 * @param {string} props.label - текст подписи
 * @param {boolean} props.checked - состояние чекбокса
 * @param {Function} props.onChange - обработчик изменения состояния
 * @param {boolean} [props.disabled=false] - заблокирован ли чекбокс
 * @param {string} [props.name] - имя поля формы
 * @param {string} [props.className] - дополнительный CSS-класс
 */
export const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  name,
  className,
}) => {
  return (
    <div
      className={classNames(
        style.wrapper,
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
        {label}
      </label>
    </div>
  );
};
