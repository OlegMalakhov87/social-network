import { useState } from 'react';
import { api } from '../../../shared/api';
import { useNotify } from '../../../shared/hooks';

/**
 * Универсальный хук для загрузки файлов.
 * Принимает конфигурацию из mediaConfigs.js и опциональные колбэки.
 *
 * @param {Object} config - конфигурация загрузки
 * @param {string} config.endpoint - эндпоинт API
 * @param {string} config.fieldName - имя поля в FormData
 * @param {Function} config.validators - композиция валидаторов
 * @param {Object} [options] - опции
 * @param {Function} [options.onSuccess] - колбэк при успехе (получает response.data)
 * @param {Function} [options.onError] - колбэк при ошибке
 * @returns {Object} { preview, isUploading, error, progress, handleFileChange, reset }
 */
export const useFileUpload = (config, options = {}) => {
  const notify = useNotify();
  const { uploadFn, onSuccess, onError } = options;

  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Сброс состояния и очистка памяти.
   */
  const reset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    setProgress(0);
    setIsUploading(false);
  };

  /**
   * Обработчик выбора файла.
   * @param {Event} e - событие change от input[type=file]
   */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);

    const validationError = await config.validators(file);
    if (validationError) {
      setError(validationError);
      notify.error(validationError);
      onError?.(validationError);
      e.target.value = '';
      return;
    }

    // Создание превью
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    // Отправка на сервер
    try {
      let result;
      if (uploadFn) {
        result = await uploadFn(file);
      } else {
        const formData = new FormData();
        formData.append(config.fieldName, file);

        const response = await api.post(config.endpoint, formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percent);
            }
          },
          timeout: 120000,
        });
        result = response.data;
      }

      notify.success('Файл успешно загружен');
      onSuccess?.(result);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Ошибка загрузки файла';
      setError(errorMessage);
      notify.error(errorMessage);
      onError?.(errorMessage);
      setPreview(null);
    } finally {
      // Очистка памяти (предотвращает утечки)
      URL.revokeObjectURL(objectUrl);
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return {
    preview,
    isUploading,
    error,
    progress,
    handleFileChange,
    reset,
  };
};
