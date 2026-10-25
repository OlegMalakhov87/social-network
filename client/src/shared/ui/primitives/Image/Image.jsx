/**
 * Отображает изображение и подставляет запасной адрес при ошибке загрузки.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.src - Адрес изображения
 * @param {string} [props.fallback='/no-image-1200x720.png'] - Запасное изображение
 * @param {string} [props.alt='Изображение'] - Альтернативный текст
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Изображение.
 */

export const Image = ({
  src,
  fallback = '/no-image-1200x720.png',
  alt = 'Изображение',
  className = '',
  ...rest
}) => {
  /**
   * Подставляет запасное изображение после ошибки загрузки.
   *
   * @param {Object} event - Событие ошибки изображения
   * @param {HTMLImageElement} event.currentTarget - Элемент изображения
   * @returns {void}
   */
  const handleError = ({ currentTarget }) => {
    currentTarget.onerror = null;
    currentTarget.src = fallback;
  };
  return (
    <img
      src={src || fallback}
      onError={handleError}
      alt={alt}
      className={className}
      {...rest}
    />
  );
};
