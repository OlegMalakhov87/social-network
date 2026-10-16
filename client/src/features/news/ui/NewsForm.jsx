import { useRef, useState } from 'react';
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
  const isCancellingRef = useRef(false);

  /** Обработчик отправки формы */
  const handleSubmit = async (values) => {
    try {
      await onSubmit?.(values, isEdit, initialData?.id);
    } catch (error) {
      notify.error(
        getApiErrorDisplay(
          error,
          isEdit ? 'Ошибка обновления новости' : 'Ошибка добавления новости'
        )
      );
      throw error;
    }

    // С этого момента сохранение на сервере уже успешно.
    const usedUrls = [values.newsUrl, values.previewUrl, values.thumbnailUrl];

    const results = await Promise.all([
      imageUpload.finalize(usedUrls),
      videoUpload.finalize(usedUrls),
    ]);

    if (!results.every(Boolean)) {
      console.warn('[NewsForm] Не все неиспользуемые временные файлы очищены');
    }

    imageUpload.reset();
    videoUpload.reset();

    notify.success(
      isEdit ? 'Новость успешно обновлена' : 'Новость успешно добавлена'
    );
    onClose?.();
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
    onSuccess: (data) => {
      form.setValue('newsUrl', data.newsUrl);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);
    },
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(NEWS_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('newsUrl', data.newsUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);

      void imageUpload.cleanupUploadedFile().then((isCleaned) => {
        if (!isCleaned) {
          console.warn('[NewsForm] Не удалось очистить часть старых медиа');
        }
      });

      imageUpload.reset();
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

      form.setValue('type', value);
      form.setValue('newsUrl', null);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);

      if (currentUpload) {
        currentUpload.reset();

        const isCleaned = await currentUpload.cleanupUploadedFile();

        if (!isCleaned) {
          console.warn('[NewsForm] Часть временных файлов будет очищена позже');
        }
      }
    } finally {
      setIsChangingType(false);
    }
  };

  /** Обработчик закрытия формы */
  const handleCancel = async () => {
    if (isCancellingRef.current || form.isSubmitting) return;

    isCancellingRef.current = true;

    // Сначала инвалидируем запросы и очищаем UI.
    // Это защищает от применения ответа загрузки
    // после начала закрытия формы.
    videoUpload.reset();
    imageUpload.reset();

    try {
      const results = await Promise.all([
        videoUpload.cleanupUploadedFile(),
        imageUpload.cleanupUploadedFile(),
      ]);

      if (!results.every(Boolean)) {
        console.warn(
          '[NewsForm] Не все неиспользуемые временные файлы очищены'
        );
      }
    } finally {
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
          menuPlacement="up"
          disabled={form.isSubmitting || isUploading || isChangingType}
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
            {form.isSubmitting || isUploading
              ? 'Загрузка...'
              : isEdit
                ? 'Сохранить'
                : 'Добавить'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
