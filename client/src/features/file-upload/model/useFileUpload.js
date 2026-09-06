import { useRef, useState } from 'react';
import { api } from '../../../shared/api';

/**
 * Универсальный хук для загрузки файлов.
 *
 * Управляет:
 * - локальным preview;
 * - загрузкой файла;
 * - прогрессом;
 * - временно загруженным файлом;
 * - очисткой временного файла;
 * - фиксацией файла после успешного сохранения сущности.
 *
 * @param {Object} config - конфигурация загрузки
 * @param {string} config.endpoint - endpoint API
 * @param {string} config.fieldName - имя поля FormData
 * @param {Function} config.validators - валидаторы файла
 * @param {Function} [config.deleteFn] - функция удаления загруженного файла
 * @param {Object} [options]
 * @param {Function} [options.uploadFn] - кастомная функция загрузки
 * @param {Function} [options.onSuccess] - callback после успешной загрузки
 * @param {Function} [options.onError] - callback ошибки
 */
export const useFileUpload = (config, options = {}) => {
  const { uploadFn, onSuccess, onError } = options;

  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadedFileRef = useRef(null);

  /**
   * Сбрасывает только локальное состояние.
   *
   * Файл на сервере НЕ удаляется.
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
   * Удаляет временно загруженный файл с сервера.
   */
  const cleanupUploadedFile = async () => {
    const uploadedFile = uploadedFileRef.current;
    
    if (!uploadedFile || !config.deleteFn) {
      return;
    }

    try {
      await config.deleteFn(uploadedFile);
      uploadedFileRef.current = null;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Ошибка удаления загруженного файла';

      setError(errorMessage);
      onError?.(errorMessage);

      throw err;
    }
  };

  /**
   * Фиксирует загруженный файл.
   *
   * После commit файл считается принадлежащим сущности,
   * поэтому cleanupUploadedFile() больше не должен его удалять.
   */
  const commit = () => {
    uploadedFileRef.current = null;
  };

  /**
   * Обработчик выбора файла.
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Сначала проверяем новый файл.
    const validationError = await config.validators(file);

    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      e.target.value = '';
      return;
    }

    // Новый файл валиден.
    // Теперь можно удалить предыдущий временный файл.
    try {
      await cleanupUploadedFile();
    } catch {
      e.target.value = '';
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setError(null);
    setProgress(0);
    setIsUploading(true);

    // Создаём локальное preview.
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

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

      uploadedFileRef.current = result;
      onSuccess?.(result);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Ошибка загрузки файла';

      setError(errorMessage);
      onError?.(errorMessage);

      setPreview(null);
    } finally {
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
    cleanupUploadedFile,
    commit,
  };
};
