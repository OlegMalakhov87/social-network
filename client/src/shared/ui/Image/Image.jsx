/**  Компонент для обработки изображений.
 *
 * @param {Object} props
 * @param {string} props.src - URL изображения
 * @param {string} props.fallback - URL изображения-заглушки
 * @param {string} props.alt - альтернативный текст изображения
 * @param {Object} props.rest - остальные пропсы
 */

export const Image = ({ src, fallback, alt, ...rest }) => {
  const handleError = ({ currentTarget }) => {
    currentTarget.onerror = null;
    currentTarget.src = fallback;
  };
  return <img src={src} onError={handleError} alt={alt} {...rest} />;
};
