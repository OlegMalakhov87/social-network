import { CATEGORY_OPTIONS } from '../../../entities/video';
import { useForm, useNotify } from '../../../shared/hooks';
import {
  getApiErrorDisplay,
  integer,
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
  TextArea,
} from '../../../shared/ui';
import {
  VIDEO_PREVIEW_CONFIG,
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
  const notify = useNotify();
  /** Форма для добавления/редактирования видео с валидацией */
  const form = useForm({
    initialValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      year: initialData?.year ?? '',
      videoUrl: initialData?.videoUrl ?? '',
      previewUrl: initialData?.previewUrl ?? '',
      thumbnailUrl: initialData?.thumbnailUrl ?? '',
      category: initialData?.category ?? '',
      isPublic: initialData?.isPublic ?? true,
      viewsCount: initialData?.viewsCount ?? 0,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      description: [maxLength(2000, 'Максимум 2000 символов')],
      year: [
        integer(
          1900,
          new Date().getFullYear(),
          'Год должен быть от 1900 до текущего'
        ),
      ],
      videoUrl: [required('Загрузите видео')],
      category: [required('Выберите категорию')],
    }),
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values, isEdit, initialData?.id);
        onClose?.();
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка добавления видео'));
        throw error;
      }
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

  /** Хук для загрузки превью */
  const previewUpload = useFileUpload(VIDEO_PREVIEW_CONFIG, {
    onSuccess: (data) => form.setValue('previewUrl', data.previewUrl),
  });

  /** Флаг загрузки */
  const isUploading =
    videoUpload.isUploading ||
    thumbnailUpload.isUploading ||
    previewUpload.isUploading;

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
        <Input
          label="Год"
          {...form.register('year')}
          placeholder="Год выпуска видео"
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={VIDEO_UPLOAD_CONFIG.accept}
          label="Видеофайл *"
          buttonText="Выбрать видео"
          preview={videoUpload.preview}
          isUploading={videoUpload.isUploading}
          progress={videoUpload.progress}
          error={videoUpload.error || form.errors.videoUrl}
          onChange={videoUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={VIDEO_THUMBNAIL_CONFIG.accept}
          label="Обложка"
          buttonText="Выбрать обложку"
          preview={thumbnailUpload.preview}
          isUploading={thumbnailUpload.isUploading}
          progress={thumbnailUpload.progress}
          error={thumbnailUpload.error || form.errors.thumbnailUrl}
          onChange={thumbnailUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <FileInput
          accept={VIDEO_PREVIEW_CONFIG.accept}
          label="Превью"
          buttonText="Выбрать превью"
          preview={previewUpload.preview}
          isUploading={previewUpload.isUploading}
          progress={previewUpload.progress}
          error={previewUpload.error || form.errors.previewUrl}
          onChange={previewUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Категория *"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting || isUploading}
        />

        <Checkbox
          id="isPublic "
          name="isPublic"
          label="Публичное видео (видно всем) *"
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
