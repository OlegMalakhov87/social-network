import { useDispatch } from 'react-redux';
import { FORM_FIELDS } from '..';
import { updateUser, uploadAvatar } from '../../../entities/auth';
import { useForm, useNotify } from '../../../shared/hooks';
import {
  Avatar,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  FileInput,
  Input,
} from '../../../shared/ui';
import { AVATAR_UPLOAD_CONFIG, useFileUpload } from '../../file-upload';
import { SettingsSection } from './SettingsSection';
import style from './SettingsForm.module.css';

/**
 * Компонент формы редактирования профиля.
 *
 * @param {Object} props
 * @param {Object} props.currentUser - текущий пользователь.
 * @returns {JSX.Element}
 */
export const EditProfileForm = ({ currentUser }) => {
  const dispatch = useDispatch();
  const notify = useNotify();

  /** Форма для редактирования профиля */
  const form = useForm({
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

  /** Хук для загрузки фото */
  const { preview, isUploading, error, handleFileChange } = useFileUpload(
    AVATAR_UPLOAD_CONFIG,
    {
      uploadFn: async (data) => {
        try {
          await dispatch(uploadAvatar(data)).unwrap();
          notify.success('Аватар успешно загружен');
        } catch (error) {
          notify.error(error || 'Ошибка загрузки аватара');
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
              <Avatar
                src={preview || currentUser?.avatar}
                size="xl"
                fallback="/avatar.png"
                alt="Аватар"
              />
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
          {FORM_FIELDS.map((field) => (
            <div key={field.name} className={getFieldGridClass(field)}>
              <Input
                label={field.label}
                type={field.multiline ? undefined : field.type}
                multiline={field.multiline}
                rows={field.rows}
                fullWidth
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
    </SettingsSection>
  );
};
