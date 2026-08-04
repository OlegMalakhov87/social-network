import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  login,
  selectAuthError,
  selectIsAuthLoading,
} from '../../../entities/auth';
import { useForm } from '../../../shared/hooks';
import { email, required } from '../../../shared/lib';
import {
  Alert,
  BaseCard,
  Button,
  Input,
  Text,
  useToast,
} from '../../../shared/ui';
import style from './RegisterForm.module.css';

/**
 * Форма входа в аккаунт.
 */
export const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const authError = useSelector(selectAuthError);
  const isSubmitting = useSelector(selectIsAuthLoading);

  const form = useForm({
    initialValues: { email: '', password: '' },
    rules: {
      email: [required('Email обязателен'), email('Неверный формат email')],
      password: [required('Пароль обязателен')],
    },
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        toast.success('Добро пожаловать!');
        navigate('/profile');
      } catch (error) {
        toast.error(error || 'Ошибка авторизации');
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

            <Input
              label="Email"
              type="email"
              {...form.register('email')}
              placeholder="email@example.com"
              disabled={form.isSubmitting || isSubmitting}
            />

            <Input
              label="Пароль"
              type="password"
              {...form.register('password')}
              placeholder="Введите ваш пароль"
              disabled={form.isSubmitting || isSubmitting}
            />

            <div className={style.actions}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
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
