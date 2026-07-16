import style from './EntityDates.module.css';

/**
 * Универсальный блок дат сущности.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {string} [props.secondaryLabel]
 * @param {string} [props.secondaryValue]
 */

export const EntityDates = ({
  label,
  value,
  secondaryLabel,
  secondaryValue,
}) => {
  if (!value) return null;

  return (
    <div className={style.wrapper}>
      <div className={style.row}>
        <span className={style.label}>{label}</span>

        <span className={style.value}>{value}</span>
      </div>

      {secondaryValue && (
        <div className={style.row}>
          <span className={style.label}>{secondaryLabel}</span>

          <span className={style.value}>{secondaryValue}</span>
        </div>
      )}
    </div>
  );
};
