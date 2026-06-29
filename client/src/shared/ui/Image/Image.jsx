/**  Компонент для обработки изображений */

export const Image = ({ src, fallback, alt, ...rest }) => {
  const handleError = ({ currentTarget }) => {
    currentTarget.onerror = null;
    currentTarget.src = fallback;
  };
  return <img src={src} onError={handleError} alt={alt} {...rest} />;
};
