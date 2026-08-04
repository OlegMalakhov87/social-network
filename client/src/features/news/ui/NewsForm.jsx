import { CATEGORY_OPTIONS, NEWS_TYPES } from '../../../entities/news';
import { useForm } from '../../../shared/hooks';
import { maxLength, minLength, required } from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  FileInput,
  Input,
  Modal,
  Select,
  TextArea,
} from '../../../shared/ui';
import {
  NEWS_IMAGE_UPLOAD_CONFIG,
  NEWS_VIDEO_UPLOAD_CONFIG,
  useFileUpload,
} from '../../file-upload';

/**
 * Форма добавления/редактирования новости. Используется для создания и редактирования новостей.
 * Поддерживает типы: text, image, video.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} [props.initialData] - данные новости для редактирования
 * @param {string} props.userName - имя текущего пользователя
 * @param {Function} props.onClose - функция для закрытия формы
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const NewsForm = ({ initialData = {}, userName, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);

  /** Форма для создания/редактирования новости с валидацией*/
  const form = useForm({
    initialValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      source: initialData?.source || '',
      type: initialData?.type || 'text',
      author: initialData?.author || userName,
      mediaUrl: initialData?.mediaUrl || '',
    },
    rules: (values) => ({
      title: [
        required('Введите заголовок'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      content: [
        required('Введите текст новости'),
        minLength(50, 'Минимально 50 символов'),
        maxLength(5000, 'Максимум 5000 символов'),
      ],
      category: [required('Выберите категорию')],
      source: [
        required('Введите название издания'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      mediaUrl: values.type !== 'text' ? [required('Загрузите медиафайл')] : [],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  /** Хук для загрузки изображения */
  const imageUpload = useFileUpload(NEWS_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('mediaUrl', data.mediaUrl),
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(NEWS_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('mediaUrl', data.mediaUrl),
  });

  /** Флаг загрузки */
  const isUploading = imageUpload.isUploading || videoUpload.isUploading;

  /** Конфигурация загрузки */
  const activeUpload = form.values.type === 'video' ? videoUpload : imageUpload;
  const activeConfig =
    form.values.type === 'video'
      ? NEWS_VIDEO_UPLOAD_CONFIG
      : NEWS_IMAGE_UPLOAD_CONFIG;

  /** Обработчик изменения типа новости */
  const handleTypeChange = (value) => {
    form.setValue('type', value);
    form.setValue('mediaUrl', '');
    imageUpload.reset();
    videoUpload.reset();
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? '✏️ Редактировать новость' : '📰 Добавить новость'}
      size="md"
    >
      <form onSubmit={form.submit}>
        <Input
          label="Заголовок *"
          {...form.register('title')}
          placeholder="Введите заголовок"
          disabled={form.isSubmitting || isUploading}
        />

        <TextArea
          label="Текст новости *"
          {...form.register('content')}
          placeholder="Введите текст новости"
          rows={3}
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Категория *"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting || isUploading}
        />

        <Input
          label="Источник"
          {...form.register('source')}
          placeholder="Название издания"
          disabled={form.isSubmitting || isUploading}
        />

        <Select
          label="Тип новости *"
          {...form.register('type')}
          options={NEWS_TYPES}
          disabled={form.isSubmitting || isUploading}
          onChange={handleTypeChange}
        />

        {form.values.type !== 'text' && (
          <FileInput
            label={form.values.type === 'image' ? 'Изображение' : 'Видео'}
            accept={activeConfig.accept}
            buttonText={
              form.values.type === 'image'
                ? 'Выбрать изображение'
                : 'Выбрать видео'
            }
            preview={activeUpload.preview}
            isUploading={activeUpload.isUploading}
            progress={activeUpload.progress}
            error={activeUpload.error}
            onChange={activeUpload.handleFileChange}
            disabled={form.isSubmitting || isUploading}
          />
        )}

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
            disabled={form.isSubmitting || isUploading}
            loading={form.isSubmitting || isUploading}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
