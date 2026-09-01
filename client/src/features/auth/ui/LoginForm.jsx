import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LOGIN_CONFIG } from '..';
import {
  clearError,
  login,
  selectAuthError,
  selectIsAuthLoading,
} from '../../../entities/auth';
import { useForm, useNotify } from '../../../shared/hooks';
import { email, getApiErrorDisplay, required } from '../../../shared/lib';
import { Alert, BaseCard, Button, Input, Text } from '../../../shared/ui';
import style from './AuthForm.module.css';

/**
 * Форма входа в аккаунт.
 */
export const LoginForm = () => {
  const dispatch = useDispatch();
  const notify = useNotify();
  const authError = useSelector(selectAuthError);
  const isSubmitting = useSelector(selectIsAuthLoading);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const form = useForm({
    initialValues: { email: '', password: '' },
    rules: {
      email: [required('Email обязателен'), email('Неверный формат email')],
      password: [required('Пароль обязателен')],
    },
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка авторизации'));
        throw error;
      }
    },
  });

  return (
    <div className={style.authWrapper}>
      <BaseCard
        className={style.authCard}
        content={
          <form onSubmit={form.submit} className={style.form}>
            {authError && (
              <Alert
                variant="error"
                title="Ошибка входа"
                className={style.alert}
                closable={true}
                onClose={() => dispatch(clearError())}
              >
                {authError}
              </Alert>
            )}

            <Text variant="h2" className={style.title}>
              Вход в аккаунт
            </Text>
            <Text variant="body2" className={style.subtitle}>
              Введите свои данные для продолжения
            </Text>

            {LOGIN_CONFIG.map((field) => (
              <Input
                key={field.name}
                name={field.name}
                label={field.label}
                required={field.required}
                type={field.type}
                {...form.register(field.name)}
                error={form.errors[field.name]}
                placeholder={field.placeholder}
                disabled={form.isSubmitting || isSubmitting}
              />
            ))}

            <div className={style.actions}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={form.isSubmitting || isSubmitting}
                loading={form.isSubmitting || isSubmitting}
              >
                Войти
              </Button>

              <Text variant="body2" className={style.footerText}>
                Ещё нет аккаунта?{' '}
                <Link to="/register" className={style.link}>
                  Зарегистрироваться
                </Link>
              </Text>
            </div>
          </form>
        }
      />
    </div>
  );
};
