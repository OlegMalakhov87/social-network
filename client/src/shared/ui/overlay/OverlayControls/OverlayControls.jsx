import style from './OverlayControls.module.css';

/**
 * Отображает элементы управления наложения.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.left - Левая часть наложения
 * @param {React.ReactNode} props.right - Правая часть наложения
 * @returns {JSX.Element} Элементы управления наложения.
 */
export const OverlayControls = ({ left, right }) => {
  return (
    <div className={style.overlay}>
      <div>{left}</div>

      <div>{right}</div>
    </div>
  );
};
