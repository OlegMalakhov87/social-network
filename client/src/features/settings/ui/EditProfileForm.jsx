import { useDispatch } from 'react-redux';
import { FORM_FIELDS } from '..';
import { updateUser } from '../../../entities/auth';
import { useAppForm, useNotify } from '../../../shared/hooks';
import {
  Avatar,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  Input,
} from '../../../shared/ui';
import style from './SettingsForm.module.css';

/**
 * Компонент формы редактирования профиля.
 *
 * @param {Object} props - пропсы компонента.
 * @param {Object} props.currentUser - текущий пользователь.
 * @returns {JSX.Element}
 */
export const EditProfileForm = ({ currentUser }) => {
  const dispatch = useDispatch();
  const notify = useNotify();
  const form = useAppForm({
    initialValues: {
      name: currentUser?.name || '',
      nickname: currentUser?.nickname || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      age: currentUser?.age || '',
      address: currentUser?.address || '',
      job: currentUser?.job || '',
      status: currentUser?.status || '',
    },
    onSubmit: async (values) => {
      try {
        await dispatch(updateUser(values)).unwrap();
        notify.success('Профиль успешно обновлён');
      } catch (error) {
        notify.error(error || 'Ошибка обновления профиля');
      }
    },
  });

  if (!currentUser) return null;

  return (
    <div className={style.formWrapper}>
      <EntityHeader
        leftSlot={
          <EntityMeta
            avatar={
              <Avatar
                src={currentUser.photoUrl}
                size="xl"
                fallback="/support.png"
              />
            }
            title={form.values.name}
            subtitle={form.values.email}
          />
        }
        rightSlot={
          <Button variant="secondary" size="sm">
            Изменить фото
          </Button>
        }
        className={style.profileHeader}
      />

      <form onSubmit={form.submit} className={style.form}>
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
                disabled={form.isSubmitting}
              />
            </div>
          ))}
        </div>

        <ButtonGroup className={style.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={form.reset}
            disabled={form.isSubmitting}
          >
            Отменить
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
};
