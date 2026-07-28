import { CATEGORY_OPTIONS } from '../../../entities/video';
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
  VIDEO_THUMBNAIL_CONFIG,
  VIDEO_UPLOAD_CONFIG,
  useFileUpload,
} from '../../file-upload';
/**
 * Форма добавления/редактирования видео.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} [props.initialData] - данные видео для редактирования
 * @param {Function} props.onClose - функция для закрытия формы
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const VideoForm = ({ initialData = {}, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для добавления/редактирования видео с валидацией */
  const form = useAppForm({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      year: initialData?.year || '',
      videoUrl: initialData?.videoUrl || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      category: initialData?.category || '',
      isPublic: initialData?.isPublic ?? true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      description: [
        required('Введите описание'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
      year: [
        minLength(4, 'Минимально 4 символа'),
        maxLength(4, 'Максимум 4 символа'),
      ],
      videoUrl: [required('Загрузите видео')],
      thumbnailUrl: [required('Загрузите обложку')],
      category: [required('Выберите категорию')],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('videoUrl', data.videoUrl),
  });

  /** Хук для загрузки обложки */
  const thumbnailUpload = useFileUpload(VIDEO_THUMBNAIL_CONFIG, {
    onSuccess: (data) => form.setValue('thumbnailUrl', data.thumbnailUrl),
  });

  /** Флаг загрузки */
  const isUploading = videoUpload.isUploading || thumbnailUpload.isUploading;

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? '✏️ Редактировать видео' : '🎬 Добавить видео'}
      size="md"
    >
      <form onSubmit={form.submit}>
        <Input
          label="Название *"
          {...form.register('title')}
          placeholder="Введите название видео"
          disabled={form.isSubmitting || isUploading}
        />

        <TextArea
          label="Описание"
          {...form.register('description')}
          placeholder="Краткое описание видео"
          rows={3}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={VIDEO_UPLOAD_CONFIG.accept}
          label="Видеофайл *"
          buttonText="Выбрать видео"
          preview={videoUpload.preview}
          isUploading={videoUpload.isUploading}
          progress={videoUpload.progress}
          error={videoUpload.error}
          onChange={videoUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={VIDEO_THUMBNAIL_CONFIG.accept}
          label="Превью (обложка)"
          buttonText="Выбрать превью"
          preview={thumbnailUpload.preview}
          isUploading={thumbnailUpload.isUploading}
          progress={thumbnailUpload.progress}
          error={thumbnailUpload.error}
          onChange={thumbnailUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Категория"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting || isUploading}
        />

        <Checkbox
          id="isPublic"
          name="isPublic"
          label="Публичное видео (видно всем)"
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
              onClose();
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
