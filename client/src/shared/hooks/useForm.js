import { useCallback, useMemo, useState } from 'react';

/**
 * Хранит значения формы, проверяет поля и отправляет данные.
 *
 * @param {Object} params - Параметры формы
 * @param {Object} params.initialValues - Начальные значения
 * @param {Object|Function} [params.rules={}] - Правила проверки или функция от значений
 * @param {Function} [params.onSubmit] - Отправляет проверенные значения
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   isValid: boolean,
 *   isSubmitting: boolean,
 *   setValue: Function,
 *   onBlur: Function,
 *   submit: Function,
 *   register: Function,
 *   reset: Function,
 *   validate: Function,
 *   validateField: Function
 * }} Состояние формы и методы управления.
 */
export const useForm = ({ initialValues, rules = {}, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationRules = useMemo(
    () => (typeof rules === 'function' ? rules(values) : rules),
    [rules, values]
  );

  /**
   * Проверяет одно поле.
   *
   * @param {string} field - Имя поля
   * @returns {boolean} Признак успешной проверки поля.
   */
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

  /**
   * Проверяет все поля.
   *
   * @param {Object} [vals=values] - Проверяемые значения
   * @returns {boolean} Признак успешной проверки всех полей.
   */
  const validate = useCallback(
    (vals = values) => {
      let valid = true;
      const nextErrors = {};

      for (const field of Object.keys(validationRules)) {
        const validators = validationRules[field] || [];
        for (const validator of validators) {
          const error = validator(vals[field], vals);
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
    },
    [validationRules, values]
  );

  /**
   * Записывает значение поля.
   *
   * @param {string} field - Имя поля
   * @param {*} value - Новое значение
   * @returns {void}
   */
  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Сбрасывает ошибку поля при изменении.
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  /**
   * Проверяет поле при потере фокуса.
   *
   * @param {string} field - Имя поля
   * @returns {boolean} Признак успешной проверки поля.
   */
  const handleBlur = useCallback(
    (field) => validateField(field),
    [validateField]
  );

  /**
   * Проверяет форму и отправляет обрезанные значения.
   *
   * @param {Event} [e] - Событие отправки
   * @returns {Promise<boolean>} Признак успешной отправки.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (isSubmitting) return false;

      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => {
          const v = typeof value === 'string' ? value.trim() : value;
          return [key, v === '' ? null : v];
        })
      );

      const valid = validate(trimmedValues);
      if (!valid) return false;

      setValues(trimmedValues);

      setIsSubmitting(true);
      try {
        await onSubmit?.(trimmedValues);
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

  /**
   * Связывает поле ввода со значением, ошибкой и обработчиками.
   *
   * @param {string} name - Имя поля
   * @param {Object} [extra={}] - Дополнительные свойства поля
   * @returns {{
   *   name: string,
   *   value: *,
   *   error: string,
   *   onChange: Function,
   *   onBlur: Function
   * }} Свойства поля ввода.
   */
  const register = useCallback(
    (name, extra = {}) => ({
      name,
      value: values[name] ?? '',
      error: fieldErrors[name],
      /**
       * Записывает значение из события или переданное значение напрямую.
       *
       * @param {Event|*} e - Событие поля ввода или новое значение
       * @returns {void}
       */
      onChange: (e) => {
        const next =
          e != null && typeof e === 'object' && 'target' in e
            ? e.target.value
            : e;
        setValue(name, next);
      },
      onBlur: () => handleBlur(name),
      ...extra,
    }),
    [values, fieldErrors, setValue, handleBlur]
  );

  /**
   * Возвращает форму к начальным значениям.
   *
   * @returns {void}
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setFieldErrors({});
  }, [initialValues]);

  const isValid = useMemo(
    () => Object.values(fieldErrors).every((e) => !e) && !isSubmitting,
    [fieldErrors, isSubmitting]
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
