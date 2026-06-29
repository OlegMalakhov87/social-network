import style from './ProfileInfoList.module.css';

/**
 * Универсальный список информационных полей.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: React.ReactNode}>} props.items
 */
export const ProfileInfoList = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <dl className={style.list}>
      {items.map(({ label, value }) => (
        <div
          key={label}
          className={style.row}
        >
          <dt className={style.label}>
            {label}
          </dt>

          <dd className={style.value}>
            {value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
};