import styles from './EntityDates.module.css';

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
