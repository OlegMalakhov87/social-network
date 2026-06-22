/* Обработка изображений*/

export const ImageWithFallback = ({ src, fallback, alt, ...rest }) => {
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = fallback;
  };
  return <img src={src} onError={handleError} alt={alt} {...rest} />;
};
