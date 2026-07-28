import { GENRE_OPTIONS } from '../../../entities/track';
import { useAppForm } from '../../../shared/hooks';
import { maxLength, minLength, required } from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FileInput,
  Input,
  Modal,
  Select,
  TextArea,
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

  /** Форма для создания/редактирования трека с валидацией*/
  const form = useAppForm({
    initialValues: {
      title: initialData?.title || '',
      artist: initialData?.artist || '',
      album: initialData?.album || '',
      year: initialData?.year || '',
      audioUrl: initialData?.audioUrl || '',
      coverUrl: initialData?.coverUrl || '',
      genre: initialData?.genre || '',
      description: initialData?.description || '',
      isPublic: initialData?.isPublic || true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      artist: [
        required('Введите исполнителя'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      album: [
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      year: [
        minLength(4, 'Минимально 4 символов'),
        maxLength(4, 'Максимум 4 символов'),
      ],
      genre: [required('Выберите жанр')],
      description: [
        minLength(10, 'Минимально 10 символов'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      audioUrl: [required('Загрузите аудиофайл')],
      coverUrl: [required('Загрузите обложку альбома')],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  /** Хук для загрузки аудиофайла */
  const trackUpload = useFileUpload(TRACK_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('audioUrl', data.audioUrl),
  });

  /** Хук для загрузки обложки альбома */
  const coverUpload = useFileUpload(ALBUM_COVER_CONFIG, {
    onSuccess: (data) => form.setValue('coverUrl', data.coverUrl),
  });

  /** Флаг загрузки */
  const isUploading = trackUpload.isUploading || coverUpload.isUploading;

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? '✏️ Редактировать трек' : '📰 Добавить трек'}
      size="md"
    >
      <form onSubmit={form.submit}>
        <Input
          label="Название *"
          {...form.register('title')}
          placeholder="Название трека"
          disabled={form.isSubmitting || isUploading}
        />
        <Input
          label="Исполнитель *"
          {...form.register('artist')}
          placeholder="Имя исполнителя или группы"
          disabled={form.isSubmitting || isUploading}
        />
        <Input
          label="Альбом"
          {...form.register('album')}
          placeholder="Название альбома (необязательно)"
          disabled={form.isSubmitting || isUploading}
        />

        <Input
          label="Год"
          {...form.register('year')}
          placeholder="Год выпуска альбома"
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Жанр"
          {...form.register('genre')}
          options={GENRE_OPTIONS}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={TRACK_UPLOAD_CONFIG.accept}
          label="Аудиофайл *"
          buttonText="Выбрать аудиофайл"
          preview={trackUpload.preview}
          isUploading={trackUpload.isUploading}
          progress={trackUpload.progress}
          error={trackUpload.error}
          onChange={trackUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={ALBUM_COVER_CONFIG.accept}
          label="Обложка альбома"
          buttonText="Выбрать обложку"
          preview={coverUpload.preview}
          isUploading={coverUpload.isUploading}
          progress={coverUpload.progress}
          error={coverUpload.error}
          onChange={coverUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <TextArea
          label="Описание"
          {...form.register('description')}
          placeholder="Введите описание трека"
          rows={3}
          disabled={form.isSubmitting || isUploading}
        />

        <Checkbox
          id="isPublic"
          name="isPublic"
          label="Публичный трек (виден всем)"
          checked={form.values.isPublic}
          onChange={(e) => form.setValue('isPublic', e.target.checked)}
          disabled={form.isSubmitting || isUploading}
        />

        <ButtonGroup>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              form.reset();
              onClose?.();
            }}
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
