import { useEffect, useRef } from 'react';

import { getApiErrorDisplay } from '../../../lib';
import { Button, Image, Text } from '../../../ui';
import { classNames } from '../../../utils';

import style from './FileInput.module.css';

/**
 * Принимает файл и показывает ход загрузки.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.accept - Допустимые типы MIME
 * @param {string} [props.label] - Подпись поля
 * @param {string} [props.hint] - Текст подсказки
 * @param {string} [props.buttonText='Выбрать файл'] - Текст кнопки
 * @param {string} [props.preview] - Адрес предварительного просмотра
 * @param {boolean} [props.isUploading=false] - Признак загрузки
 * @param {number} [props.progress] - Ход загрузки от 0 до 100
 * @param {Error|Object|string} [props.error] - Ошибка загрузки
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {Function} [props.onChange] - Обработчик выбора файла
 * @param {boolean} [props.required=false] - Признак обязательного поля
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Поле выбора файла.
 */
export const FileInput = ({
  accept,
  label,
  hint,
  buttonText = 'Выбрать файл',
  preview,
  isUploading = false,
  progress,
  error,
  disabled = false,
  onChange,
  required = false,
  className = '',
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  /**
   * Передаёт событие выбора файла наружному обработчику.
   *
   * @param {Event} e - Событие изменения поля
   * @returns {void}
   */
  const handleChange = (e) => {
    onChange?.(e);
  };

  return (
    <div className={classNames(style.wrapper, className)}>
      <label className={style.label}>
        <Text variant="body2">
          {label}
          {required && <span className={style.required}>*</span>}
        </Text>

        {hint && (
          <span className={style.hintWrapper}>
            <Text variant="caption" className={style.hint}>
              {hint}
            </Text>
          </span>
        )}
      </label>

      <div className={style.container}>
        {preview && (
          <div className={style.preview}>
            {accept.startsWith('video/') ? (
              <video src={preview} controls className={style.media} />
            ) : (
              <Image src={preview} alt="Превью" className={style.media} />
            )}
          </div>
        )}

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

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={handleChange}
          disabled={disabled || isUploading}
        />
      </div>

      {error && (
        <Text variant="caption" className={style.error}>
          {getApiErrorDisplay(error, 'Ошибка загрузки файла')}
        </Text>
      )}
    </div>
  );
};
