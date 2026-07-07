/**  Компонент для обработки изображений.
 *
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.fallback
 * @param {string} props.alt
 * @param {Object} props.rest
 */

export const Image = ({ src, fallback, alt, ...rest }) => {
  const handleError = ({ currentTarget }) => {
    currentTarget.onerror = null;
    currentTarget.src = fallback;
  };
  return <img src={src} onError={handleError} alt={alt} {...rest} />;
};
