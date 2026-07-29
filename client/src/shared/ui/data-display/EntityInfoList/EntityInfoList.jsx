import style from './EntityInfoList.module.css';

/**
 * Универсальный список информационных полей для сущности.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: React.ReactNode}>} props.items - массив характеристик
 */

export const EntityInfoList = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <dl className={style.list}>
      {items.map(({ label, value }) => (
        <div key={label} className={style.row}>
          <dt className={style.label}>{label}</dt>

          <dd className={style.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};
