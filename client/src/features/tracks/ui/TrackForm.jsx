import { TRACK_CONFIG } from '..';
import { CATEGORY_OPTIONS } from '../../../entities/track';
import { useForm, useNotify } from '../../../shared/hooks';
import {
  getApiErrorDisplay,
  maxLength,
  minLength,
  required,
} from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FileInput,
  Input,
  Modal,
  Select,
} from '../../../shared/ui';
import {
  ALBUM_COVER_CONFIG,
  TRACK_UPLOAD_CONFIG,
  useFileUpload,
} from '../../file-upload';
/**
 * Форма добавления/редактирования трека с валидацией.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} [props.initialData] - данные трека для редактирования
 * @param {Function} props.onClose - функция для закрытия формы
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const TrackForm = ({ initialData = {}, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  const notify = useNotify();

  /** Обработчик отправки формы */
  const handleSubmit = async (values) => {
    try {
      await onSubmit?.(values, isEdit, initialData?.id);
      trackUpload.commit();
      coverUpload.commit();
      trackUpload.reset();
      coverUpload.reset();
      notify.success(
        isEdit ? 'Трек успешно обновлен' : 'Трек успешно добавлен'
      );
      onClose?.();
    } catch (error) {
      notify.error(
        getApiErrorDisplay(
          error,
          isEdit ? 'Ошибка обновления трека' : 'Ошибка добавления трека'
        )
      );
      throw error;
    }
  };

  /** Форма для создания/редактирования трека с валидацией*/
  const form = useForm({
    initialValues: {
      title: initialData?.title ?? null,
      artist: initialData?.artist ?? null,
      album: initialData?.album ?? null,
      year: initialData?.year ?? new Date().getFullYear(),
      audioUrl: initialData?.audioUrl ?? null,
      coverUrl: initialData?.coverUrl ?? null,
      category: initialData?.category ?? null,
      description: initialData?.description ?? null,
      isPublic: initialData?.isPublic ?? true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      artist: [
        required('Введите исполнителя'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      album: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      category: [required('Выберите жанр')],
      description: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(2000, 'Максимум 2000 символов'),
      ],
      audioUrl: [
        required('Загрузите аудиофайл'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      coverUrl: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
    }),
    onSubmit: handleSubmit,
  });

  /** Хук для загрузки аудиофайла */
  const trackUpload = useFileUpload(TRACK_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('audioUrl', data.audioUrl);
      form.setValue('duration', data.duration);
    },
  });

  /** Хук для загрузки обложки альбома */
  const coverUpload = useFileUpload(ALBUM_COVER_CONFIG, {
    onSuccess: (data) => form.setValue('coverUrl', data.coverUrl),
  });

  /** Флаг загрузки */
  const isUploading = trackUpload.isUploading || coverUpload.isUploading;

  /** Обработчик закрытия формы */
  const handleCancel = async () => {
    try {
      await Promise.all([
        trackUpload.cleanupUploadedFile(),
        coverUpload.cleanupUploadedFile(),
      ]);
    } finally {
      trackUpload.reset();
      coverUpload.reset();
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      onClose={handleCancel}
      title={isEdit ? '✏️ Редактировать трек' : '📰 Добавить трек'}
      size="sm"
    >
      <form onSubmit={form.submit}>
        {TRACK_CONFIG.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            type={field.multiline ? undefined : field.type}
            multiline={field.multiline}
            rows={field.rows}
            disabled={form.isSubmitting || isUploading}
            {...form.register(field.key)}
          />
        ))}

        <FileInput
          accept={TRACK_UPLOAD_CONFIG.accept}
          label="Аудиофайл *"
          buttonText="Выбрать аудиофайл"
          preview={trackUpload.preview}
          isUploading={trackUpload.isUploading}
          progress={trackUpload.progress}
          error={trackUpload.error || form.errors.audioUrl}
          onChange={trackUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={ALBUM_COVER_CONFIG.accept}
          label="Обложка"
          hint="Можно загрузить свою обложку или оставить поле пустым."
          buttonText="Выбрать обложку"
          preview={coverUpload.preview}
          isUploading={coverUpload.isUploading}
          progress={coverUpload.progress}
          error={coverUpload.error || form.errors.coverUrl}
          onChange={coverUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Категория"
          required={true}
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting || isUploading}
          helperText={form.errors.category}
        />

        <Checkbox
          id="isPublic"
          label="Кому доступен трек"
          name="isPublic"
          description={
            form.values.isPublic
              ? 'Всем пользователям'
              : 'Только вам и вашим друзьям'
          }
          align="end"
          checked={form.values.isPublic}
          onChange={(e) => form.setValue('isPublic', e.target.checked)}
          disabled={form.isSubmitting || isUploading}
        />

        <ButtonGroup>
          <Button
            variant="secondary"
            type="button"
            onClick={handleCancel}
            disabled={form.isSubmitting || isUploading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            loading={form.isSubmitting || isUploading}
            disabled={form.isSubmitting || isUploading}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
