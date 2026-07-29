import { useRef } from 'react';
import { Button, Image, Text } from '..';
import { classNames } from '../../utils';
import style from './FileInput.module.css';

/**
 * Универсальный компонент для загрузки файлов.
 *
 * @param {Object} props
 * @param {string} props.accept - допустимые MIME-типы (например, 'image/jpeg,image/png')
 * @param {string} [props.label] - текст лейбла
 * @param {string} [props.buttonText='Выбрать файл'] - текст кнопки
 * @param {string} [props.preview] - URL превью (для изображений/видео)
 * @param {boolean} [props.isUploading=false] - состояние загрузки
 * @param {string} [props.progress] - прогресс загрузки (0-100)
 * @param {string} [props.error] - текст ошибки
 * @param {boolean} [props.disabled=false] - заблокирован ли компонент
 * @param {Function} props.onChange - обработчик выбора файла
 * @param {string} [props.className=''] - дополнительный CSS класс
 */
export const FileInput = ({
  accept,
  label,
  buttonText = 'Выбрать файл',
  preview,
  isUploading = false,
  progress,
  error,
  disabled = false,
  onChange,
  className = '',
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    onChange?.(e);
  };

  return (
    <div className={classNames(style.wrapper, className)}>
      {label && (
        <Text variant="body2" className={style.label}>
          {label}
        </Text>
      )}

      <div className={style.container}>
        {/* Превью (если есть) */}
        {preview && (
          <div className={style.preview}>
            {accept.startsWith('video/') ? (
              <video src={preview} controls className={style.media} />
            ) : (
              <Image src={preview} alt="Превью" className={style.media} />
            )}
          </div>
        )}

        {/* Кнопка загрузки */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClick}
          loading={isUploading}
          disabled={disabled}
          className={style.button}
        >
          {isUploading ? 'Загрузка...' : buttonText}
        </Button>

        {/* Прогресс-бар (если есть) */}
        {isUploading && progress !== undefined && (
          <div className={style.progressBar}>
            <div
              className={style.progressFill}
              style={{ width: `${progress}%` }}
            />
            <Text variant="caption" className={style.progressText}>
              {progress}%
            </Text>
          </div>
        )}

        {/* Скрытый input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={handleChange}
          disabled={disabled || isUploading}
        />
      </div>

      {/* Ошибка */}
      {error && (
        <Text variant="caption" className={style.error}>
          {error}
        </Text>
      )}
    </div>
  );
};
