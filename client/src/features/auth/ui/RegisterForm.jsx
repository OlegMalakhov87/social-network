import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.css';

export const RegisterForm = ({ onRegister }) => {
  const navigate = useNavigate();
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

  const validateForm = () => {
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
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Очищаем ошибку при вводе
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
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

      // Успешная регистрация
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
  };

  const handleSocialRegister = (provider) => {
    setNotification({
      type: 'info',
      message: `Регистрация через ${provider}...`,
    });
    // Здесь будет логика OAuth
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        {/* Шапка */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoText}>SocialNetwork</div>
          </div>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Присоединяйтесь к сообществу</p>
        </div>

        {/* Уведомление */}
        {notification && (
          <div
            className={`${styles.notification} ${styles[`notification${notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}`]}`}
          >
            <span className={styles.notificationIcon}>
              {notification.type === 'success'
                ? '✅'
                : notification.type === 'error'
                  ? '❌'
                  : 'ℹ️'}
            </span>
            <span className={styles.notificationMessage}>
              {notification.message}
            </span>
            <button className={styles.closeButton} onClick={closeNotification}>
              ✕
            </button>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Имя */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>👤</span>
              Имя
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
              placeholder="Введите ваше имя"
              disabled={isLoading}
            />
            {errors.name && (
              <div className={styles.errorMessage}>
                <span>⚠️</span> {errors.name}
              </div>
            )}
          </div>

          {/* Никнейм и Возраст */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>@</span>
                Никнейм
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={styles.input}
                placeholder="@username"
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🎂</span>
                Возраст
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`${styles.input} ${errors.age ? styles.error : ''}`}
                placeholder="От 14 до 99"
                min="14"
                max="99"
                disabled={isLoading}
              />
              {errors.age && (
                <div className={styles.errorMessage}>
                  <span>⚠️</span> {errors.age}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📧</span>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="email@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <div className={styles.errorMessage}>
                <span>⚠️</span> {errors.email}
              </div>
            )}
          </div>

          {/* Пароль */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🔒</span>
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="Не менее 6 символов"
              disabled={isLoading}
            />
            {errors.password && (
              <div className={styles.errorMessage}>
                <span>⚠️</span> {errors.password}
              </div>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✓</span>
              Подтвердите пароль
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder="Введите пароль еще раз"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <div className={styles.errorMessage}>
                <span>⚠️</span> {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Пол */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>⚥</span>
              Пол
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={styles.input}
              disabled={isLoading}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>

          {/* Согласие с условиями */}
          <div className={styles.terms}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className={styles.checkbox}
              disabled={isLoading}
              id="terms"
            />
            <label htmlFor="terms">
              Я согласен с{' '}
              <Link to="/terms" className={styles.termsLink}>
                условиями использования
              </Link>{' '}
              и{' '}
              <Link to="/privacy" className={styles.termsLink}>
                политикой конфиденциальности
              </Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <div
              className={styles.errorMessage}
              style={{ marginTop: '-10px', marginBottom: '10px' }}
            >
              <span>⚠️</span> {errors.agreeTerms}
            </div>
          )}

          {/* Кнопка регистрации */}
          <button
            type="submit"
            className={`${styles.button} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Разделитель */}
        <div className={styles.divider}>или</div>

        {/* Социальная регистрация */}
        <div style={{ padding: '0 30px 30px' }}>
          <div className={styles.socialButtons}>
            <button
              className={styles.socialButton}
              onClick={() => handleSocialRegister('Google')}
              disabled={isLoading}
            >
              <span className={styles.socialIcon}>G</span>
              Google
            </button>
            <button
              className={styles.socialButton}
              onClick={() => handleSocialRegister('VK')}
              disabled={isLoading}
            >
              <span className={styles.socialIcon}>VK</span>
              VK
            </button>
          </div>

          {/* Ссылка на вход */}
          <div className={styles.loginLink}>
            Уже есть аккаунт?
            <Link to="/login" className={styles.link}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
