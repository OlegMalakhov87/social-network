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

  const abortControllerRef = useRef(null);

  // URL -> fieldName
  const temporaryMediaRef = useRef(new Map());

  // URL -> Promise<boolean>
  const deletionPromisesRef = useRef(new Map());

  const previewUrlRef = useRef(null);
  const isMountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const uploadingRef = useRef(false);

  const configRef = useRef(config);
  const callbacksRef = useRef({ onSuccess, onError });

  configRef.current = config;
  callbacksRef.current = { onSuccess, onError };

  /**
   * Получает записи временных медиафайлов из данных ответа сервера.
   * @param {Object} data - данные ответа сервера
   * @param {Object} currentConfig - текущая конфигурация загрузки
   * @returns {Array} - массив записей временных медиафайлов
   */
  const getMediaEntries = useCallback((data, currentConfig) => {
    const fields = currentConfig.mediaFields ?? [currentConfig.fieldName];

    return fields
      .filter(
        (fieldName) =>
          typeof data?.[fieldName] === 'string' && data[fieldName].length > 0
      )
      .map((fieldName) => ({
        fieldName,
        url: data[fieldName],
      }));
  }, []);

  /**
   * Удаляет URL-адрес предпросмотра файла.
   */
  const revokePreview = useCallback(() => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  /**
   * Удаляет одну временную запись.
   * @param {string} url - URL записи
   * @param {string} fieldName - имя поля записи
   * @param {Function} deleteFn - функция удаления записи
   * @returns {Promise<boolean>} - результат удаления
   */
  const deleteMedia = useCallback(async (url, fieldName, deleteFn) => {
    const existing = deletionPromisesRef.current.get(url);

    if (existing) return existing;

    if (!deleteFn) return false;

    const promise = (async () => {
      try {
        await deleteFn({ [fieldName]: url });

        // Не удаляем запись, если по этому URL уже
        // зарегистрировано другое значение.
        if (temporaryMediaRef.current.get(url) === fieldName) {
          temporaryMediaRef.current.delete(url);
        }

        return true;
      } catch (err) {
        console.error('[FileUpload] Ошибка удаления:', err);
        return false;
      } finally {
        deletionPromisesRef.current.delete(url);
      }
    })();

    deletionPromisesRef.current.set(url, promise);

    return promise;
  }, []);

  /**
   * Удаляет все временные записи данного экземпляра хука.
   * @returns {Promise<boolean>} - результат удаления
   */
  const cleanupUploadedFile = useCallback(async () => {
    const entries = [...temporaryMediaRef.current.entries()];

    if (entries.length === 0) return true;

    const deleteFn = configRef.current.deleteFn;

    const results = await Promise.all(
      entries.map(([url, fieldName]) => deleteMedia(url, fieldName, deleteFn))
    );

    return results.every(Boolean);
  }, [deleteMedia]);

  /**
   * Вызывается ТОЛЬКО после успешного сохранения сущности.
   * @param {Array} usedUrls - массив URL загруженных файлов
   * @returns {Promise<boolean>} - результат фиксации
   */
  const finalize = useCallback(
    async (usedUrls = []) => {
      const used = new Set(usedUrls.filter(Boolean));
      const entries = [...temporaryMediaRef.current.entries()];

      // Эти URL уже закреплены сервером в сущности.
      for (const [url] of entries) {
        if (used.has(url)) {
          temporaryMediaRef.current.delete(url);
        }
      }

      const unusedEntries = entries.filter(([url]) => !used.has(url));

      if (unusedEntries.length === 0) return true;

      const deleteFn = configRef.current.deleteFn;

      const results = await Promise.all(
        unusedEntries.map(([url, fieldName]) =>
          deleteMedia(url, fieldName, deleteFn)
        )
      );

      return results.every(Boolean);
    },
    [deleteMedia]
  );

  /**
   * Сбрасывает UI, но НЕ забывает временные файлы.
   */
  const reset = useCallback(() => {
    requestIdRef.current += 1;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    uploadingRef.current = false;

    revokePreview();

    if (isMountedRef.current) {
      setPreview(null);
      setError(null);
      setProgress(0);
      setIsUploading(false);
    }
  }, [revokePreview]);

  /**
   * Обработчик изменения файла.
   * @param {Event} event - событие изменения файла
   * @returns {Promise<boolean>} - результат обработки файла
   */
  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];

      if (!file) return false;

      const input = event.target;

      // Ref защищает даже до следующего React-render.
      if (uploadingRef.current) {
        input.value = '';
        return false;
      }

      const controller = new AbortController();

      abortControllerRef.current = controller;

      uploadingRef.current = true;
      const requestId = ++requestIdRef.current;
      const currentConfig = configRef.current;

      try {
        const validationError = await currentConfig.validators?.(file);

        if (requestId !== requestIdRef.current) {
          return false;
        }

        if (validationError) {
          if (isMountedRef.current) {
            setError(validationError);
          }

          callbacksRef.current.onError?.(validationError);
          return false;
        }

        if (isMountedRef.current) {
          setError(null);
          setProgress(0);
          setIsUploading(true);
        }

        if (!currentConfig.uploadFn) {
          throw new Error('Функция загрузки файла не определена');
        }

        const formData = new FormData();
        formData.append(currentConfig.fieldName, file);

        const response = await currentConfig.uploadFn(formData, {
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            if (
              requestId !== requestIdRef.current ||
              !isMountedRef.current ||
              !progressEvent.total
            ) {
              return;
            }

            setProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          },
          timeout: 120000,
        });

        const uploadedFile = response?.data ?? response;
        const entries = getMediaEntries(uploadedFile, currentConfig);

        if (entries.length === 0) {
          throw new Error('Сервер не вернул URL загруженного файла');
        }

        for (const { url, fieldName } of entries) {
          temporaryMediaRef.current.set(url, fieldName);
        }

        // Если форму закрыли во время запроса,
        // удаляем только что загруженные временные файлы.
        if (requestId !== requestIdRef.current || !isMountedRef.current) {
          await Promise.all(
            entries.map(({ url, fieldName }) =>
              deleteMedia(url, fieldName, currentConfig.deleteFn)
            )
          );

          return false;
        }

        // Обновление формы должно быть синхронным.
        callbacksRef.current.onSuccess?.(uploadedFile);

        revokePreview();

        if (currentConfig.fieldName !== 'audioUrl') {
          const objectUrl = URL.createObjectURL(file);
          previewUrlRef.current = objectUrl;
          setPreview(objectUrl);
        } else {
          setPreview(null);
        }

        return true;
      } catch (err) {
        if (requestId === requestIdRef.current && isMountedRef.current) {
          const message = parseApiError(err, 'Ошибка загрузки файла');

          setError(message);
          callbacksRef.current.onError?.(message);
        }

        return false;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        if (requestId === requestIdRef.current) {
          uploadingRef.current = false;

          if (isMountedRef.current) {
            setIsUploading(false);
          }
        }

        input.value = '';
      }
    },
    [deleteMedia, getMediaEntries, revokePreview]
  );

  /**
   * Монтирует компонент.
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;

      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      revokePreview();

      // Резервная очистка, если компонент закрыли
      // без явного вызова cleanupUploadedFile().
      void cleanupUploadedFile();
    };
  }, [cleanupUploadedFile, revokePreview]);

  return {
    preview,
    isUploading,
    error,
    progress,
    handleFileChange,
    cleanupUploadedFile,
    finalize,
    reset,
  };
};
