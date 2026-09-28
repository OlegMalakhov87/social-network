import { useCallback, useEffect, useRef, useState } from 'react';
import { parseApiError } from '../../../shared/lib';

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
 * @param {string} config.fieldName - имя поля FormData
 * @param {Function} config.validators - валидаторы файла
 * @param {Function} config.uploadFn - функция загрузки файла
 * @param {Function} [config.deleteFn] - функция удаления загруженного файла
 * @param {Object} [options]
 * @param {Function} [options.onSuccess] - callback после успешной загрузки
 * @param {Function} [options.onError] - callback ошибки
 */
export const useFileUpload = (config, options = {}) => {
  const { onSuccess, onError } = options;

  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadedFileRef = useRef(null);
  const isCommittedRef = useRef(false);
  const isMountedRef = useRef(true);

  /**
   * Сбрасывает только локальное состояние,
   * не удаляя файл на сервере.
   */
  const reset = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setError(null);
    setProgress(0);
    setIsUploading(false);
  }, [preview]);

  /**
   * Удаляет временно загруженный файл с сервера.
   */
  const cleanupUploadedFile = useCallback(async () => {
    const uploadedFile = uploadedFileRef.current;

    if (!uploadedFile || !config?.deleteFn) {
      return true;
    }

    // Если файл уже был успешно committed, то cleanup не должен его удалять.
    if (isCommittedRef.current) {
      return true;
    }

    try {
      await config.deleteFn(uploadedFile);
      uploadedFileRef.current = null;
      return true;
    } catch (err) {
      setError(parseApiError(err, 'Ошибка удаления файла'));

      return false;
    }
  }, [config]);

  /**
   * Фиксирует загруженный файл.
   *
   * После commit файл считается принадлежащим сущности,
   * поэтому cleanupUploadedFile() больше не должен его удалять.
   */
  const commit = useCallback(() => {
    uploadedFileRef.current = null;
    isCommittedRef.current = true;
  }, []);

  /**
   * Обработчик выбора файла.
   */
  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];

      if (!file) return false;

      // Сначала проверяем новый файл.
      const validationError = await config?.validators?.(file);

      if (validationError) {
        if (isMountedRef.current) {
          setError(validationError);
        }
        onError?.(validationError);
        e.target.value = '';
        return false;
      }

      // Новый файл валиден. Удаляем предыдущий временный файл.
      const cleanedUp = await cleanupUploadedFile();

      // Если удаление предыдущего файла не удалось, то возвращаем false.
      if (!cleanedUp) {
        e.target.value = '';
        return false;
      }

      // Удаляем предыдущий preview.
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Обновляем локальное состояние.
      if (isMountedRef.current) {
        setPreview(null);
        setError(null);
        setProgress(0);
        setIsUploading(true);
      }

      let objectUrl = null;
      
      // Создаём локальное preview.
      if (config?.fieldName !== 'audioUrl') {
        objectUrl = URL.createObjectURL(file);
      }

      // Обновляем локальное состояние.
      if (isMountedRef.current) {
        setPreview(objectUrl);
      }

      try {
        // Создаём FormData.
        const formData = new FormData();
        formData.append(config?.fieldName, file);

        // Если функция загрузки не определена, то удаляем preview и возвращаем false.
        if (!config?.uploadFn) {
          URL.revokeObjectURL(objectUrl);

          return false;
        }

        // Загружаем файл.
        const res = await config.uploadFn(formData, {
          onUploadProgress: (progressEvent) => {
            // Если total не определен или компонент не смонтирован, то возвращаем.
            if (!progressEvent.total || !isMountedRef.current) {
              return;
            }

            // Обновляем прогресс.
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setProgress(percent);
          },
          timeout: 120000,
        });

        const uploadedFile = res?.data ?? res;

        // Если компонент не смонтирован, то удаляем preview и возвращаем false.
        if (!isMountedRef.current) {
          if (!isCommittedRef.current && config?.deleteFn) {
            try {
              await config.deleteFn(uploadedFile);
            } catch (cleanupError) {
              console.error(
                'Не удалось удалить временный файл после unmount:',
                cleanupError
              );
            }
          }

          URL.revokeObjectURL(objectUrl);

          return false;
        }

        // Если файл уже зафиксирован, то возвращаем true.
        if (isCommittedRef.current) {
          return true;
        }

        // Фиксируем файл.
        uploadedFileRef.current = uploadedFile;

        onSuccess?.(uploadedFile);

        return true;
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        if (isMountedRef.current) {
          setError(parseApiError(err, 'Ошибка загрузки файла'));
          setPreview(null);
        }

        return false;
      } finally {
        if (isMountedRef.current) {
          setIsUploading(false);
        }

        e.target.value = '';
      }
    },
    [cleanupUploadedFile, config, onError, onSuccess, preview]
  );

  // Удаление временного файла при размонтировании компонента.
  useEffect(() => {
    // Монтируем компонент.
    isMountedRef.current = true;

    // Размонтируем компонент.
    return () => {
      isMountedRef.current = false;

      // Если файл не зафиксирован и функция удаления определена, то удаляем файл.
      if (
        uploadedFileRef.current &&
        !isCommittedRef.current &&
        config?.deleteFn
      ) {
        // Удаляем файл.
        config.deleteFn(uploadedFileRef.current).catch((error) => {
          console.error(
            'Не удалось удалить временный файл при unmount:',
            error
          );
        });

        // Сбрасываем ссылку на файл.
        uploadedFileRef.current = null;
      }

      // Удаляем preview.
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [config, preview]);

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
