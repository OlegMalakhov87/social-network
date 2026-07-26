import { useCallback, useState } from 'react';
import { useForm, useValidation } from '..';

/**
 * Универсальный хук для работы с формами.
 *
 * @param {Object} params
 * @param {Object} params.initialValues - начальные значения формы
 * @param {Object|Function} [params.rules={}] - правила валидации (объект или функция от values)
 * @param {Function} params.onSubmit - функция для отправки формы
 * @returns {Object}
 */
export const useAppForm = ({ initialValues, rules = {}, onSubmit }) => {
  const form = useForm(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationRules =
    typeof rules === 'function' ? rules(form.values) : rules;

  const validation = useValidation(form.values, validationRules);

  const handleChange = useCallback(
    (field, value) => {
      form.setValue(field, value);
      if (validation.errors[field]) {
        validation.validateField(field);
      }
    },
    [form, validation]
  );

  const handleBlur = useCallback(
    (field) => {
      validation.validateField(field);
    },
    [validation]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      if (isSubmitting) return false;

      const valid = validation.validate();
      if (!valid) return false;

      setIsSubmitting(true);
      form.clearErrors();

      try {
        await onSubmit?.(form.values);
        form.reset();
        validation.resetErrors();
        return true;
      } catch (error) {
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

  const register = useCallback(
    (name, extra = {}) => ({
      name,
      value: form.values[name],
      error: form.errors[name] || validation.errors[name],
      onChange: (value) => handleChange(name, value),
      onBlur: () => handleBlur(name),
      ...extra,
    }),
    [form.values, form.errors, validation.errors, handleChange, handleBlur]
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
