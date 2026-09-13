import { useState } from 'react';
import { NEWS_CONFIG } from '..';
import { CATEGORY_OPTIONS, NEWS_TYPES } from '../../../entities/news';
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
  FileInput,
  Input,
  Modal,
  SegmentedControl,
  Select,
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
 * @param {Function} props.onClose - функция для закрытия формы
 * @param {Function} props.onSubmit - функция для отправки формы
 * @param {Object} props.currentUser - текущий пользователь
 */
export const NewsForm = ({
  initialData = {},
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [isChangingType, setIsChangingType] = useState(false);
  const isEdit = Boolean(initialData?.id);
  const notify = useNotify();

  /** Обработчик отправки формы */
  const handleSubmit = async (values) => {
    try {
      await onSubmit?.(values, isEdit, initialData?.id);
      imageUpload.commit();
      videoUpload.commit();
      imageUpload.reset();
      videoUpload.reset();
      form.reset();
      notify.success(
        isEdit ? 'Новость успешно обновлена' : 'Новость успешно добавлена'
      );
      onClose?.();
    } catch (error) {
      notify.error(
        getApiErrorDisplay(
          error,
          isEdit ? 'Ошибка обновления новости' : 'Ошибка добавления новости'
        )
      );
      throw error;
    }
  };

  /** Форма для создания/редактирования новости с валидацией*/
  const form = useForm({
    initialValues: {
      uploader: currentUser,
      title: initialData?.title ?? null,
      text: initialData?.text ?? null,
      category: initialData?.category ?? null,
      source: initialData?.source ?? null,
      type: initialData?.type ?? 'text',
      newsUrl: initialData?.newsUrl ?? null,
      previewUrl: initialData?.previewUrl ?? null,
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
    },
    rules: (values) => ({
      title: [
        required('Введите заголовок'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      text: [
        required('Введите текст'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(5000, 'Максимум 5000 символов'),
      ],
      source: [
        required('Введите название издания'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      category: [required('Выберите категорию')],
      newsUrl:
        values.type !== 'text'
          ? [
              required('Загрузите медиафайл'),
              minLength(1, 'Минимально 1 символ'),
              maxLength(500, 'Максимум 500 символов'),
            ]
          : [],
      previewUrl: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      thumbnailUrl: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
    }),
    onSubmit: handleSubmit,
  });

  /** Хук для загрузки изображения */
  const imageUpload = useFileUpload(NEWS_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('newsUrl', data.newsUrl),
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(NEWS_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('newsUrl', data.newsUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);
    },
  });

  /** Флаг загрузки */
  const isUploading = imageUpload.isUploading || videoUpload.isUploading;

  /** Конфигурация загрузки */
  const activeUpload = form.values.type === 'video' ? videoUpload : imageUpload;

  /** Конфигурация загрузки */
  const activeConfig =
    form.values.type === 'video'
      ? NEWS_VIDEO_UPLOAD_CONFIG
      : NEWS_IMAGE_UPLOAD_CONFIG;

  /** Обработчик изменения типа новости */
  const handleTypeChange = async (value) => {
    setIsChangingType(true);

    try {
      const currentUpload =
        form.values.type === 'video'
          ? videoUpload
          : form.values.type === 'image'
            ? imageUpload
            : null;

      await currentUpload?.cleanupUploadedFile();

      form.setValue('type', value);
      form.setValue('title', null);
      form.setValue('text', null);
      form.setValue('category', null);
      form.setValue('source', null);
      form.setValue('newsUrl', null);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);

      currentUpload.reset();
    } catch {
      // Не меняем тип, если старый файл не удалось удалить
    } finally {
      setIsChangingType(false);
    }
  };

  /** Обработчик закрытия формы */
  const handleCancel = async () => {
    try {
      await Promise.all([
        imageUpload.cleanupUploadedFile(),
        videoUpload.cleanupUploadedFile(),
      ]);
    } finally {
      imageUpload.reset();
      videoUpload.reset();
      form.reset();
      onClose?.();
    }
  };

  return (
    <Modal
      onClose={handleCancel}
      title={isEdit ? '✏️ Редактировать новость' : '📰 Добавить новость'}
      size="sm"
    >
      <form onSubmit={form.submit}>
        {/* Выбор типа новости */}
        <SegmentedControl
          options={NEWS_TYPES}
          disabled={form.isSubmitting || isUploading || isChangingType}
          {...form.register('type')}
          onChange={handleTypeChange}
        />

        {NEWS_CONFIG.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            type={field.multiline ? undefined : field.type}
            multiline={field.multiline}
            rows={field.rows}
            disabled={form.isSubmitting || isUploading || isChangingType}
            {...form.register(field.key)}
          />
        ))}

        <Select
          label="Категория"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          required={true}
          disabled={form.isSubmitting || isUploading || isChangingType}
          helperText={form.errors.category}
        />

        {/* Динамическое поле для медиафайла */}
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
            error={activeUpload.error || form.errors.newsUrl}
            onChange={activeUpload.handleFileChange}
            disabled={form.isSubmitting || isUploading || isChangingType}
            required={true}
          />
        )}

        {/* Кнопки действий: Отмена, Сохранить, Добавить */}
        <ButtonGroup>
          <Button
            variant="secondary"
            type="button"
            size="sm"
            disabled={form.isSubmitting || isUploading || isChangingType}
            onClick={handleCancel}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={form.isSubmitting || isUploading || isChangingType}
            loading={form.isSubmitting || isUploading || isChangingType}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
