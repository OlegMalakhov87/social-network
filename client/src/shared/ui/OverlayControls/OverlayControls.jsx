import style from './OverlayControls.module.css';

export const OverlayControls = ({ left, right }) => {
  return (
    <div className={style.overlay}>
      <div>{left}</div>

      <div>{right}</div>
    </div>
  );
};
