import { useCallback, useMemo, useState } from 'react';

/**
 * Универсальная валидация форм.
 * @param {Object} values - значения формы
 * @param {Object} [rules={}] - правила валидации
 * @returns {Object} - объект с ошибками и методами валидации
 */
export const useValidation = (values, rules = {}) => {
  const [errors, setErrors] = useState({});

  /**
   * Валидация конкретного поля
   * @param {string} field - поле для валидации
   * @returns {boolean} - результат валидации
   */

  const validateField = useCallback(
    (field) => {
      const validators = rules[field] || [];
      const value = values[field];

      for (const validator of validators) {
        const error = validator(value, values);

        if (error) {
          setErrors((prev) => ({
            ...prev,
            [field]: error,
          }));

          return false;
        }
      }

      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));

      return true;
    },
    [rules, values]
  );

  /**
   * Валидация формы
   * @returns {boolean} - результат валидации
   */

  const validate = useCallback(() => {
    let valid = true;
    const nextErrors = {};

    Object.keys(rules).forEach((field) => {
      const validators = rules[field] || [];

      for (const validator of validators) {
        const error = validator(values[field], values);

        if (error) {
          nextErrors[field] = error;
          valid = false;
          break;
        }
      }

      if (!nextErrors[field]) {
        nextErrors[field] = '';
      }
    });

    setErrors(nextErrors);

    return valid;
  }, [rules, values]);

  /**
   * Сброс ошибок
   * @returns {void}
   */

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Проверка на валидность
   * @returns {boolean} - результат проверки
   */

  const isValid = useMemo(() => {
    return Object.values(errors).every((e) => !e);
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    validateField,
    resetErrors,
    setErrors,
  };
};
