import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PROFILE_SETTINGS_CONFIG, SettingsSection } from '..';
import { updateUser, uploadAvatar } from '../../../entities/auth';
import { useForm, useNotify } from '../../../shared/hooks';
import {
  date,
  email,
  getApiErrorDisplay,
  maxLength,
  minLength,
  phone,
  required,
  slug,
} from '../../../shared/lib';
import {
  Avatar,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  FileInput,
  Input,
} from '../../../shared/ui';
import { formatDateForInput } from '../../../shared/utils';
import { AVATAR_UPLOAD_CONFIG, useFileUpload } from '../../file-upload';
import style from './SettingsForm.module.css';

/**
 * Компонент формы редактирования профиля.
 *
 * @param {Object} props
 * @param {Object} props.currentUser - текущий пользователь.
 */
export const EditProfileForm = ({ currentUser }) => {
  const dispatch = useDispatch();
  const notify = useNotify();
  const navigate = useNavigate();

  /** Форма для редактирования профиля */
  const form = useForm({
    initialValues: {
      name: currentUser?.name ?? null,
      nickname: currentUser?.nickname ?? null,
      avatarUrl: currentUser?.avatarUrl ?? null,
      email: currentUser?.email ?? null,
      phone: currentUser?.phone ?? null,
      birthDate: formatDateForInput(currentUser?.birthDate) ?? null,
      address: currentUser?.address ?? null,
      job: currentUser?.job ?? null,
      status: currentUser?.status ?? null,
      isPublic: currentUser?.isPublic ?? true,
      gender: currentUser?.gender ?? 'male',
    },
    rules: {
      name: [
        required('Имя обязательно'),
        minLength(1, 'Минимум 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      nickname: [maxLength(100, 'Максимум 100 символов'), slug()],
      email: [required('Email обязательно'), email('Неверный формат email')],
      phone: [phone()],
      birthDate: [date('Введите корректную дату рождения')],
      address: [maxLength(500, 'Максимум 500 символов')],
      job: [maxLength(100, 'Максимум 100 символов')],
      status: [maxLength(500, 'Максимум 500 символов')],
      gender: [required('Пол обязательно')],
    },
    onSubmit: async (values) => {
      try {
        await dispatch(updateUser(values)).unwrap();
        notify.success('Профиль успешно обновлён');
        navigate('/profile');
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка обновления профиля'));
        throw error;
      }
    },
  });

  /** Хук для загрузки фото */
  const { preview, isUploading, error, handleFileChange } = useFileUpload(
    AVATAR_UPLOAD_CONFIG,
    {
      uploadFn: async (data) => {
        try {
          const result = await dispatch(uploadAvatar(data)).unwrap();
          form.setValue('avatarUrl', result.avatarUrl);
          notify.success('Аватар успешно загружен');
        } catch (error) {
          notify.error('Ошибка загрузки аватара');
        }
      },
    }
  );

  const getFieldGridClass = (field) =>
    field.half ? style.halfWidth : style.fullWidth;

  return (
    <SettingsSection title="Профиль">
      <EntityHeader
        leftSlot={
          <EntityMeta
            avatar={
              <Avatar src={preview || currentUser?.avatarUrl} size="xl" />
            }
            title={form.values.name}
            subtitle={form.values.email}
          />
        }
        rightSlot={
          <FileInput
            accept={AVATAR_UPLOAD_CONFIG.accept}
            buttonText="Изменить фото"
            isUploading={isUploading}
            error={error}
            onChange={handleFileChange}
          />
        }
        className={style.profileHeader}
      />

      <form onSubmit={form.submit} className={style.form}>
        <div className={style.fieldsGrid}>
          {PROFILE_SETTINGS_CONFIG.map((field) => (
            <div key={field.key} className={getFieldGridClass(field)}>
              <Input
                label={field.label}
                required={field.required}
                type={field.multiline ? undefined : field.type}
                multiline={field.multiline}
                rows={field.rows}
                fullWidth
                {...form.register(field.key)}
                placeholder={field.placeholder}
                disabled={form.isSubmitting}
              />
            </div>
          ))}
        </div>

        <ButtonGroup>
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
            Сохранить изменения
          </Button>
        </ButtonGroup>
      </form>
    </SettingsSection>
  );
};
