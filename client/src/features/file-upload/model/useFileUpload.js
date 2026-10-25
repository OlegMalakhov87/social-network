import { useCallback, useEffect, useRef, useState } from 'react';

import { parseApiError } from '../../../shared/lib';

/**
 * Загружает файл, показывает предварительный просмотр и очищает временную копию.
 *
 * @param {Object} config - Конфигурация загрузки
 * @param {string} config.fieldName - Имя поля FormData
 * @param {Function} [config.validators] - Проверка выбранного файла
 * @param {Function} config.uploadFn - Отправка файла
 * @param {Function} [config.deleteFn] - Удаление временного файла
 * @param {Array<string>} [config.mediaFields] - Имена полей с URL в ответе
 * @param {Object} [options={}] - Дополнительные обработчики
 * @param {Function} [options.onSuccess] - Обработчик успешной загрузки
 * @param {Function} [options.onError] - Обработчик ошибки загрузки
 * @returns {{
 *   preview: string|null,
 *   isUploading: boolean,
 *   error: string|{ message: string, fieldErrors?: Object }|null,
 *   progress: number,
 *   handleFileChange: Function,
 *   cleanupUploadedFile: Function,
 *   finalize: Function,
 *   reset: Function
 * }} Состояние загрузки и действия
 */
export const useFileUpload = (config, options = {}) => {
  const { onSuccess, onError } = options;

  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const abortControllerRef = useRef(null);

  // Сопоставляет URL с именем поля.
  const temporaryMediaRef = useRef(new Map());

  // Сопоставляет URL с выполняемым удалением.
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
   * Возвращает временные медиафайлы из ответа сервера.
   *
   * @param {Object} data - Данные ответа сервера
   * @param {Object} currentConfig - Текущая конфигурация загрузки
   * @returns {Array<{fieldName: string, url: string}>} Записи временных файлов
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

  const revokePreview = useCallback(() => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  /**
   * Удаляет одну временную запись.
   *
   * @param {string} url - URL записи
   * @param {string} fieldName - Имя поля записи
   * @param {Function} deleteFn - Функция удаления записи
   * @returns {Promise<boolean>} Результат удаления
   */
  const deleteMedia = useCallback(async (url, fieldName, deleteFn) => {
    const existing = deletionPromisesRef.current.get(url);

    if (existing) return existing;

    if (!deleteFn) return false;

    const promise = (async () => {
      try {
        await deleteFn({ [fieldName]: url });

        // Оставляет запись, если по этому URL уже зарегистрировано другое значение.
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
   * Закрепляет использованные файлы и удаляет остальные после сохранения сущности.
   *
   * @param {Array<string>} [usedUrls=[]] - URL файлов, закреплённых в сущности
   * @returns {Promise<boolean>} Результат фиксации
   */
  const finalize = useCallback(
    async (usedUrls = []) => {
      const used = new Set(usedUrls.filter(Boolean));
      const entries = [...temporaryMediaRef.current.entries()];

      // Сервер уже закрепил эти URL в сущности.
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

  // Сбрасывает интерфейс и сохраняет временные файлы.
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
   * Проверяет файл, загружает его и обновляет предварительный просмотр.
   *
   * @param {Event} event - Событие выбора файла
   * @returns {Promise<boolean>} Результат обработки
   */
  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];

      if (!file) return false;

      const input = event.target;

      // Проверяет флаг до следующей отрисовки React.
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
          /**
           * Обновляет процент загрузки.
           *
           * @param {Object} progressEvent - Событие прогресса
           * @param {number} progressEvent.loaded - Загруженный объём
           * @param {number} progressEvent.total - Полный объём
           * @returns {void}
           */
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

        // Удаляет временные файлы, если форму закрыли во время запроса.
        if (requestId !== requestIdRef.current || !isMountedRef.current) {
          await Promise.all(
            entries.map(({ url, fieldName }) =>
              deleteMedia(url, fieldName, currentConfig.deleteFn)
            )
          );

          return false;
        }

        // Обновляет форму синхронно.
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

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;

      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      revokePreview();

      // Очищает временные файлы, если закрытие прошло без cleanupUploadedFile().
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
