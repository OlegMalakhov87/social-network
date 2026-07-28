import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FORM_FIELDS, GENDER_OPTIONS } from '..';
import { register, selectIsAuthLoading } from '../../../entities/auth';
import { useAppForm } from '../../../shared/hooks';
import { custom, email, match, minLength, required } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  Checkbox,
  Input,
  Select,
  Text,
  useToast,
} from '../../../shared/ui';
import style from './RegisterForm.module.css';

/**
 * Форма регистрации нового пользователя.
 */
export const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const isSubmitting = useSelector(selectIsAuthLoading);

  const form = useAppForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      age: '',
      gender: 'male',
      agreeTerms: false,
    },
    rules: {
      name: [required('Имя обязательно'), minLength(2, 'Минимум 2 символа')],
      email: [required('Email обязателен'), email('Неверный формат email')],
      password: [
        required('Пароль обязателен'),
        minLength(6, 'Минимум 6 символов'),
      ],
      confirmPassword: [
        required('Подтвердите пароль'),
        match('password', 'Пароли не совпадают'),
      ],
      age: [
        custom(
          (value) => !value || (value >= 14 && value <= 99),
          'От 14 до 99 лет'
        ),
      ],
      agreeTerms: [
        custom((value) => value === true, 'Необходимо согласие с условиями'),
      ],
    },
    onSubmit: async (values) => {
      try {
        const { confirmPassword, agreeTerms, ...registerData } = values;
        await dispatch(register(registerData)).unwrap();
        toast.success('Регистрация успешна! Добро пожаловать.');
        navigate('/profile');
      } catch (error) {
        toast.error(error || 'Ошибка при регистрации');
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
                    placeholder={field.placeholder}
                    disabled={form.isSubmitting || isSubmitting}
                  />
                </div>
              ))}
            </div>

            <Select
              label="Пол"
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
          </form>
        }
        actions={
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
        }
      />
    </div>
  );
};
