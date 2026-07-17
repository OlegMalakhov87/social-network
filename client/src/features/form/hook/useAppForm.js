import { useCallback, useState } from 'react';
import { useForm } from './useForm';
import { useValidation } from './useValidation';

/**
 * Универсальный хук для работы с формами.
 *
 * @param {Object} config - конфигурация формы
 * @param {Object} config.initialValues - начальные значения формы
 * @param {Object} config.rules - правила валидации
 * @param {(values:Object)=>void|Promise<void>} config.onSubmit - колбэк на отправку формы
 * @returns {Object} - объект с значениями, ошибками, методами и флагом isSubmitting
 */

export const useAppForm = ({ initialValues, rules = {}, onSubmit }) => {
  const form = useForm(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Правила валидации */
  const validationRules =
    typeof rules === 'function' ? rules(form.values) : rules;

  /** Валидация формы с учетом правил валидации из конфигурации */
  const validation = useValidation({
    values: form.values,
    rules: validationRules,
  });

  /**
   * Обработчик изменения значения поля
   * @param {string} field - поле для изменения
   * @param {any} value - новое значение
   */
  const handleChange = useCallback(
    (field, value) => {
      form.setValue(field, value);
      if (validation.errors[field]) {
        validation.validateField(field);
      }
    },
    [form, validation]
  );

  /**
   * Обработчик фокуса на поле
   * @param {string} field - поле для фокуса
   */
  const handleBlur = useCallback(
    (field) => {
      validation.validateField(field);
    },
    [validation]
  );

  /**
   * Обработчик отправки формы
   * @returns {Promise<boolean>} - результат отправки формы
   */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      // Если уже идет отправка, игнорируем повторный вызов
      if (isSubmitting) return false;

      const valid = validation.validate();

      if (!valid) return false;

      // Устанавливаем флаг отправки формы
      setIsSubmitting(true);
      form.clearErrors();

      try {
        await onSubmit?.(form.values);
        form.reset();
        validation.resetErrors();
        return true;
      } catch (error) {
        // Если сервер вернул ошибки полей, устанавливаем их в форму
        if (error.fieldErrors) {
          form.setFormErrors(error.fieldErrors);
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, validation, onSubmit, isSubmitting]
  );

  /**
   * Регистрация поля формы
   * @param {string} name - имя поля
   * @returns {Object} - объект с значением, ошибкой и обработчиками изменения и фокуса
   */
  const register = useCallback(
    (name, extra = {}) => ({
      name,
      value: form.values[name],
      error: form.errors[name] || validation.errors[name],
      onChange: (value) => handleChange(name, value),
      onBlur: () => handleBlur(name),
      ...extra,
    }),
    [form.values, validation.errors, form.errors, handleChange, handleBlur]
  );

  return {
    values: form.values,
    errors: validation.errors,
    isValid: validation.isValid,
    isSubmitting,

    setValue: handleChange,
    onBlur: handleBlur,
    submit: handleSubmit,
    register,
    reset: () => {
      form.reset();
      validation.resetErrors();
    },

    validate: validation.validate,
    validateField: validation.validateField,
  };
};
