import { useCallback, useState } from 'react';

/**
 * Универсальный хук управления формой.
 *
 * @param {Object} initialValues - начальные значения формы
 * @returns {Object} - объект с значениями, ошибками и методами управления формой
 */
export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  /**
   * Изменение одного поля формы.
   * @param {string} field - поле для изменения
   * @param {any} value - значение для изменения
   * @returns {void}
   */
  const setValue = useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  }, []);

  /**
   * Массовое обновление значений формы.
   * @param {Object} nextValues - новые значения формы
   * @returns {void}
   */
  const setForm = useCallback((nextValues) => {
    setValues(nextValues);
  }, []);

  /**
   * Установка ошибки конкретного поля формы.
   * @param {string} field - поле для установки ошибки
   * @param {string} message - сообщение об ошибке
   * @returns {void}
   */
  const setError = useCallback((field, message) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * Установка нескольких ошибок формы.
   * @param {Object} nextErrors - новые ошибки формы
   * @returns {void}
   */
  const setFormErrors = useCallback((nextErrors) => {
    setErrors(nextErrors);
  }, []);

  /** Очистка ошибок формы.
   * @returns {void}
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**Сброс формы.
   * @returns {void}
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,

    setValue,
    setForm,

    setError,
    setFormErrors,
    clearErrors,

    reset,
  };
};
