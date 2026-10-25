import styles from './EntityDates.module.css';

/**
 * Отображает даты сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.label - Подпись даты
 * @param {string} props.value - Значение даты
 * @param {string} [props.secondaryLabel] - Подпись второй даты
 * @param {string} [props.secondaryValue] - Значение второй даты
 * @returns {JSX.Element|null} Даты или пустой результат без основной даты.
 */

export const EntityDates = ({
  label,
  value,
  secondaryLabel,
  secondaryValue,
}) => {
  if (!value) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <span className={styles.label}>{label}</span>

        <span className={styles.value}>{value}</span>
      </div>

      {secondaryValue && (
        <div className={styles.row}>
          <span className={styles.label}>{secondaryLabel}</span>

          <span className={styles.value}>{secondaryValue}</span>
        </div>
      )}
    </div>
  );
};
