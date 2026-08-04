import { POST_TYPES, VISIBILITY_OPTIONS } from '../../../entities/post';
import { useForm } from '../../../shared/hooks';
import { maxLength, minLength, required } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  ButtonGroup,
  FileInput,
  SegmentedControl,
  Select,
  TextArea,
} from '../../../shared/ui';
import {
  POST_IMAGE_UPLOAD_CONFIG,
  POST_VIDEO_UPLOAD_CONFIG,
  useFileUpload,
} from '../../file-upload';

/**
 * Форма создания/редактирования поста. Используется для создания и редактирования постов.
 * Поддерживает типы: text, image, video.
 * Поддерживает видимость: public, friends, private.
 *
 * @param {Object} props - пропсы компонента
 * @param {Object} [props.initialData] - данные поста для редактирования
 * @param {Function} props.onClose - функция для закрытия формы
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const PostForm = ({ initialData = {}, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для создания/редактирования поста с валидацией*/
  const form = useForm({
    initialValues: {
      message: initialData?.message || '',
      visibility: initialData?.visibility || 'public',
      type: initialData?.type || 'text',
      mediaUrl: initialData?.mediaUrl || '',
    },
    rules: (values) => ({
      message: [
        required('Введите текст'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(5000, 'Максимум 5000 символов'),
      ],
      mediaUrl: values.type !== 'text' ? [required('Загрузите медиафайл')] : [],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  /** Хук для загрузки изображения */
  const imageUpload = useFileUpload(POST_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('mediaUrl', data.mediaUrl),
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(POST_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('mediaUrl', data.mediaUrl),
  });

  /** Флаг загрузки */
  const isUploading = imageUpload.isUploading || videoUpload.isUploading;
  const activeUpload = form.values.type === 'video' ? videoUpload : imageUpload;
  /** Конфигурация загрузки */
  const activeConfig =
    form.values.type === 'video'
      ? POST_VIDEO_UPLOAD_CONFIG
      : POST_IMAGE_UPLOAD_CONFIG;

  /** Обработчик изменения типа поста */
  const handleTypeChange = (value) => {
    form.setValue('type', value);
    form.setValue('mediaUrl', '');
    imageUpload.reset();
    videoUpload.reset();
  };

  return (
    <BaseCard
      content={
        <form onSubmit={form.submit}>
          {/* Выбор типа поста */}
          <SegmentedControl
            options={POST_TYPES}
            {...form.register('type')}
            onChange={handleTypeChange}
          />

          {/* Поле ввода сообщения */}
          <TextArea
            {...form.register('message')}
            placeholder="Поделитесь своими новостями"
            rows={3}
            disabled={form.isSubmitting || isUploading}
          />

          {/* Динамическое поле для URL */}
          {form.values.type !== 'text' && (
            <FileInput
              accept={activeConfig.accept}
              label={form.values.type === 'image' ? 'Изображение' : 'Видео'}
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

          {/* Выбор видимости */}
          <Select
            {...form.register('visibility')}
            options={VISIBILITY_OPTIONS}
            disabled={form.isSubmitting || isUploading}
          />

          {/* Кнопки действий: Отмена, Сохранить изменения, Опубликовать */}
          <ButtonGroup>
            <Button
              variant="secondary"
              type="button"
              disabled={form.isSubmitting || isUploading}
              onClick={() => {
                form.reset();
                onClose?.();
              }}
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
      }
    />
  );
};
