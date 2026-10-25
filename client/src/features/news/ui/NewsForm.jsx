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
 * Отображает форму добавления и редактирования новости.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData={}] - Данные новости для редактирования
 * @param {Function} props.onClose - Закрывает форму
 * @param {Function} props.onSubmit - Отправляет форму
 * @param {Object} props.currentUser - Текущий пользователь
 * @returns {JSX.Element} Форма новости
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

  /**
   * Отправляет новость и закрепляет загруженные файлы.
   *
   * @param {Object} values - Значения формы
   * @returns {Promise<void>}
   */
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

    // Сохранение на сервере уже завершилось успешно.
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
    /**
     * Возвращает правила полей по типу новости.
     *
     * @param {Object} values - Значения формы
     * @param {string} values.type - Тип новости
     * @returns {Object} Правила полей
     */
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

  const imageUpload = useFileUpload(NEWS_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('newsUrl', data.newsUrl);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);
    },
  });

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

  const isUploading = imageUpload.isUploading || videoUpload.isUploading;

  const activeUpload = form.values.type === 'video' ? videoUpload : imageUpload;

  const activeConfig =
    form.values.type === 'video'
      ? NEWS_VIDEO_UPLOAD_CONFIG
      : NEWS_IMAGE_UPLOAD_CONFIG;

  /**
   * Меняет тип новости и удаляет временный файл предыдущего типа.
   *
   * @param {string} value - Новый тип новости
   * @returns {Promise<void>}
   */
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

  const handleCancel = async () => {
    if (isCancellingRef.current || form.isSubmitting) return;

    isCancellingRef.current = true;

    // Сбрасывает загрузку до очистки, чтобы ответ не попал в закрытую форму.
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
