import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { CHANGE_PASSWORD_SETTINGS_CONFIG, SettingsSection } from '..';
import { changePassword, deleteUser, logout } from '../../../entities/auth';
import { useForm, useNotify } from '../../../shared/hooks';
import { match, minLength, required } from '../../../shared/lib';
import {
  Alert,
  Button,
  ButtonGroup,
  ConfirmDialog,
  Input,
} from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы смены пароля.
 */
export const ChangePasswordForm = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();
  const notify = useNotify();

  /** Форма для смены пароля */
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    rules: {
      currentPassword: [required('Введите текущий пароль')],
      newPassword: [
        required('Введите новый пароль'),
        minLength(6, 'Минимум 6 символов'),
      ],
      confirmPassword: [
        required('Подтвердите пароль'),
        match('newPassword', 'Пароли не совпадают'),
      ],
    },
    onSubmit: async (values) => {
      try {
        await dispatch(
          changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          })
        ).unwrap();
        notify.success('Пароль успешно изменён');
        form.reset();
      } catch (error) {
        notify.error('Ошибка смены пароля');
      }
    },
  });

  /** Обработчик подтверждения удаления аккаунта */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteUser()).unwrap();
      notify.success('Аккаунт успешно удален');
      dispatch(logout());
    } catch (error) {
      notify.error('Ошибка при удалении аккаунта');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <SettingsSection title="Смена пароля">
      <form onSubmit={form.submit} className={style.form}>
        {CHANGE_PASSWORD_SETTINGS_CONFIG.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            required={field.required}
            type={field.type}
            fullWidth
            {...form.register(field.key)}
            disabled={form.isSubmitting}
            placeholder={field.placeholder}
          />
        ))}

        <ButtonGroup>
          <Button
            type="submit"
            variant="primary"
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
          >
            Изменить пароль
          </Button>
        </ButtonGroup>
      </form>

      <div className={style.dangerZone}>
        <Alert variant="warning" title="Вы уверены?">
          После удаления аккаунта все ваши данные будут безвозвратно удалены.
        </Alert>
        <Button
          variant="danger"
          className={style.deleteButton}
          disabled={form.isSubmitting}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Удалить аккаунт
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить аккаунт?"
        description="Вы уверены? Все ваши посты, сообщения и данные будут удалены навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
        loading={isDeleting}
      />
    </SettingsSection>
  );
};
