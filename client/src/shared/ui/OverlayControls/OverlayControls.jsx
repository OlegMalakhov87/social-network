import style from './OverlayControls.module.css';

/**
 * Контролы для оверлея.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.left
 * @param {React.ReactNode} props.right
 */
export const OverlayControls = ({ left, right }) => {
  return (
    <div className={style.overlay}>
      <div>{left}</div>

      <div>{right}</div>
    </div>
  );
};
