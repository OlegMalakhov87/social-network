import { useCallback, useState } from 'react';

/**
 * Универсальный хук управления формой.
 *
 * @param {Object} initialValues - начальные значения формы
 * @returns {Object} - объект с значениями, ошибками и методами управления формой
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  /**
   * Изменение одного поля.
   * @param {string} field - поле для изменения
   * @param {any} value - значение для изменения
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
   * Массовое обновление.
   * @param {Object} nextValues - новые значения формы
   */
  const setForm = useCallback((nextValues) => {
    setValues(nextValues);
  }, []);

  /**
   * Ошибка конкретного поля.
   * @param {string} field - поле для установки ошибки
   * @param {string} message - сообщение об ошибке
   */
  const setError = useCallback((field, message) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * Несколько ошибок.
   * @param {Object} nextErrors - новые ошибки формы
   */
  const setFormErrors = useCallback((nextErrors) => {
    setErrors(nextErrors);
  }, []);

  /**
   * Очистить ошибки.
   * @returns {void}
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Сброс формы.
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
