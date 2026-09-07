import { VIDEO_CONFIG } from '..';
import { CATEGORY_OPTIONS } from '../../../entities/video';
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

  /** Обработчик отправки формы */
  const handleSubmit = async (values) => {
    try {
      await onSubmit?.(values, isEdit, initialData?.id);
      videoUpload.commit();
      thumbnailUpload.commit();
      previewUpload.commit();
      videoUpload.reset();
      thumbnailUpload.reset();
      previewUpload.reset();
      notify.success(
        isEdit ? 'Видео успешно обновлено' : 'Видео успешно добавлено'
      );
      onClose?.();
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка сохранения видео'));
      throw error;
    }
  };

  /** Форма для добавления/редактирования видео с валидацией */
  const form = useForm({
    initialValues: {
      title: initialData?.title ?? null,
      description: initialData?.description ?? null,
      duration: initialData?.duration ?? null,
      size: initialData?.size ?? null,
      year: initialData?.year ?? null,
      videoUrl: initialData?.videoUrl ?? null,
      previewUrl: initialData?.previewUrl ?? null,
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
      category: initialData?.category ?? null,
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
      videoUrl: [required('Загрузите видео')],
      category: [required('Выберите категорию')],
    }),
    onSubmit: handleSubmit,
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('videoUrl', data.videoUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);
      form.setValue('duration', data.duration);
      form.setValue('size', data.size);
    },
  });

  /** Хук для загрузки обложки */
  const thumbnailUpload = useFileUpload(VIDEO_THUMBNAIL_CONFIG, {
    onSuccess: (data) => {
      form.setValue('thumbnailUrl', data.thumbnailUrl);
    },
  });

  /** Хук для загрузки превью */
  const previewUpload = useFileUpload(VIDEO_PREVIEW_CONFIG, {
    onSuccess: (data) => {
      form.setValue('previewUrl', data.previewUrl);
    },
  });

  /** Флаг загрузки */
  const isUploading =
    videoUpload.isUploading ||
    thumbnailUpload.isUploading ||
    previewUpload.isUploading;

  /** Обработчик закрытия формы */
  const handleCancel = async () => {
    try {
      await Promise.all([
        videoUpload.cleanupUploadedFile(),
        thumbnailUpload.cleanupUploadedFile(),
        previewUpload.cleanupUploadedFile(),
      ]);
    } finally {
      videoUpload.reset();
      thumbnailUpload.reset();
      previewUpload.reset();
      form.reset();
      onClose();
    }
  };

  return (
    <Modal
      onClose={handleCancel}
      title={isEdit ? '✏️ Редактировать видео' : '🎬 Добавить видео'}
      size="sm"
    >
      <form onSubmit={form.submit}>
        {VIDEO_CONFIG.map((field) => (
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
          accept={VIDEO_UPLOAD_CONFIG.accept}
          label="Видеофайл"
          buttonText="Выбрать видео"
          preview={videoUpload.preview}
          isUploading={videoUpload.isUploading}
          progress={videoUpload.progress}
          error={videoUpload.error || form.errors.videoUrl}
          onChange={videoUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
          required={true}
        />

        <FileInput
          accept={VIDEO_THUMBNAIL_CONFIG.accept}
          label="Обложка"
          hint="Можно загрузить свою обложку или оставить поле пустым — система сгенерирует её автоматически."
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
          hint="Можно загрузить своё превью или оставить поле пустым — система сгенерирует его автоматически."
          buttonText="Выбрать превью"
          preview={previewUpload.preview}
          isUploading={previewUpload.isUploading}
          progress={previewUpload.progress}
          error={previewUpload.error || form.errors.previewUrl}
          onChange={previewUpload.handleFileChange}
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Категория"
          required={true}
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting || isUploading}
        />

        <Checkbox
          id="isPublic"
          label="Кому доступно видео"
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
