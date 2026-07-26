import { useState, useCallback } from 'react';

/**
 * Хук управления формой регистрации.
 * @returns {{
 *   formData: object,
 *   errors: object,
 *   isLoading: boolean,
 *   notification: object|null,
 *   handleChange: Function,
 *   validateForm: Function,
 *   handleSubmit: Function,
 *   closeNotification: Function
 * }}
 */
export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    age: '',
    gender: 'male',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Валидация полей
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно быть не менее 2 символов';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.age && (formData.age < 14 || formData.age > 99)) {
      newErrors.age = 'Возраст должен быть от 14 до 99 лет';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласие с условиями';
    }

    return newErrors;
  }, [formData]);

  // Обработчик изменения полей
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      // Сброс ошибки поля
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  // Отправка формы
  const handleSubmit = useCallback(
    async (e, onRegister, navigate) => {
      e.preventDefault();

      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setNotification({
          type: 'error',
          message: 'Пожалуйста, исправьте ошибки в форме',
        });
        return;
      }

      setIsLoading(true);
      setNotification(null);

      try {
        // Имитация запроса к API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setNotification({
          type: 'success',
          message: 'Регистрация успешна! Перенаправляем...',
        });

        setTimeout(() => {
          if (onRegister) {
            onRegister(formData);
          }
          navigate('/profile');
        }, 2000);
      } catch (error) {
        setNotification({
          type: 'error',
          message: error.message || 'Ошибка при регистрации',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm]
  );

  const closeNotification = useCallback(() => setNotification(null), []);

  return {
    formData,
    errors,
    isLoading,
    notification,
    handleChange,
    handleSubmit,
    closeNotification,
  };
};
