import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FORM_FIELDS, GENDER_OPTIONS } from '..';
import {
  clearError,
  register,
  selectIsAuthLoading,
} from '../../../entities/auth';
import { useForm, useNotify } from '../../../shared/hooks';
import {
  custom,
  email,
  getApiErrorDisplay,
  integer,
  match,
  maxLength,
  minLength,
  required,
} from '../../../shared/lib';
import {
  BaseCard,
  Button,
  Checkbox,
  Input,
  Select,
  Text,
} from '../../../shared/ui';
import style from './RegisterForm.module.css';

/**
 * Форма регистрации нового пользователя.
 */
export const RegisterForm = () => {
  const dispatch = useDispatch();
  const notify = useNotify();
  const isSubmitting = useSelector(selectIsAuthLoading);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: 'male',
      agreeTerms: false,
    },
    rules: {
      name: [
        required('Имя обязательно'),
        minLength(1, 'Минимум 1 символа'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      email: [required('Email обязателен'), email('Неверный формат email')],
      password: [
        required('Пароль обязателен'),
        minLength(6, 'Минимум 6 символов'),
      ],
      confirmPassword: [
        required('Подтвердите пароль'),
        match('password', 'Пароли не совпадают'),
      ],
      age: [integer(1, 100, 'Возраст должен быть числом от 1 до 100 лет')],
      gender: [required('Укажите свой пол')],
      agreeTerms: [
        custom((value) => value === true, 'Необходимо согласие с условиями'),
      ],
    },
    onSubmit: async (values) => {
      try {
        await dispatch(register(values)).unwrap();
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка при регистрации'));
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
            <Text variant="h2" className={style.title}>
              Создание аккаунта
            </Text>
            <Text variant="body2" className={style.subtitle}>
              Присоединяйтесь к нашему сообществу
            </Text>

            <div className={style.fieldsGrid}>
              {FORM_FIELDS.map((field) => (
                <div
                  key={field.name}
                  className={field.half ? style.halfWidth : style.fullWidth}
                >
                  <Input
                    label={field.label}
                    type={field.type}
                    {...form.register(field.name)}
                    error={form.errors[field.name]}
                    placeholder={field.placeholder}
                    disabled={form.isSubmitting || isSubmitting}
                  />
                </div>
              ))}
            </div>

            <Select
              label="Пол *"
              {...form.register('gender')}
              options={GENDER_OPTIONS}
              disabled={form.isSubmitting || isSubmitting}
            />

            <div className={style.checkboxWrapper}>
              <Checkbox
                id="agreeTerms"
                label={
                  <Text variant="body2">
                    Я согласен с{' '}
                    <Link to="/terms" className={style.termsLink}>
                      условиями использования
                    </Link>{' '}
                    и{' '}
                    <Link to="/privacy" className={style.termsLink}>
                      политикой конфиденциальности
                    </Link>
                  </Text>
                }
                checked={form.values.agreeTerms}
                onChange={(e) => form.setValue('agreeTerms', e.target.checked)}
                disabled={form.isSubmitting || isSubmitting}
              />
              {form.errors.agreeTerms && (
                <Text variant="caption" className={style.errorText}>
                  {form.errors.agreeTerms}
                </Text>
              )}
            </div>

            <div className={style.actions}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={form.isSubmitting || isSubmitting}
              >
                Зарегистрироваться
              </Button>

              <Text variant="body2" className={style.footerText}>
                Уже есть аккаунт?{' '}
                <Link to="/login" className={style.link}>
                  Войти
                </Link>
              </Text>
            </div>
          </form>
        }
      />
    </div>
  );
};
