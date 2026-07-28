import { useCallback, useMemo, useState } from 'react';

/**
 * Универсальный хук для работы с формами.
 *
 * @param {Object} params
 * @param {Object} params.initialValues - начальные значения формы
 * @param {Object|Function} [params.rules={}] - правила валидации (объект или функция от values)
 * @param {Function} params.onSubmit - функция для отправки формы
 * @returns {Object}
 */
export const useForm = ({ initialValues, rules = {}, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationRules = useMemo(
    () => (typeof rules === 'function' ? rules(values) : rules),
    [rules, values]
  );

  /** Валидация конкретного поля. */
  const validateField = useCallback(
    (field) => {
      const validators = validationRules[field] || [];
      const value = values[field];

      for (const validator of validators) {
        const error = validator(value, values);
        if (error) {
          setFieldErrors((prev) => ({ ...prev, [field]: error }));
          return false;
        }
      }
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
      return true;
    },
    [validationRules, values]
  );

  /** Валидация всей формы. */
  const validate = useCallback(() => {
    let valid = true;
    const nextErrors = {};

    for (const field of Object.keys(validationRules)) {
      const validators = validationRules[field] || [];
      for (const validator of validators) {
        const error = validator(values[field], values);
        if (error) {
          nextErrors[field] = error;
          valid = false;
          break;
        }
      }
      if (!nextErrors[field]) nextErrors[field] = '';
    }

    setFieldErrors(nextErrors);
    return valid;
  }, [validationRules, values]);

  /** Изменение поля. */
  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Сбрасываем ошибку поля при изменении
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  /** Обработчик onBlur — валидирует поле при уходе с него. */
  const handleBlur = useCallback(
    (field) => validateField(field),
    [validateField]
  );

  /** Сабмит формы. */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (isSubmitting) return false;

      const valid = validate();
      if (!valid) return false;

      setIsSubmitting(true);
      try {
        await onSubmit?.(values);
        setValues(initialValues);
        setFieldErrors({});
        return true;
      } catch (error) {
        if (error?.fieldErrors) {
          setFieldErrors((prev) => ({ ...prev, ...error.fieldErrors }));
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, isSubmitting, values, initialValues]
  );

  /** Регистрация поля (для удобной привязки к инпутам). */
  const register = useCallback(
    (name, extra = {}) => ({
      name,
      value: values[name],
      error: fieldErrors[name],
      onChange: (value) => setValue(name, value),
      onBlur: () => handleBlur(name),
      ...extra,
    }),
    [values, fieldErrors, setValue, handleBlur]
  );

  /** Сброс формы. */
  const reset = useCallback(() => {
    setValues(initialValues);
    setFieldErrors({});
  }, [initialValues]);

  const isValid = useMemo(
    () => Object.values(fieldErrors).every((e) => !e),
    [fieldErrors]
  );

  return {
    values,
    errors: fieldErrors,
    isValid,
    isSubmitting,
    setValue,
    onBlur: handleBlur,
    submit: handleSubmit,
    register,
    reset,
    validate,
    validateField,
  };
};
