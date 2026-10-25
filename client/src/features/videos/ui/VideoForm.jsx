import { useRef } from 'react';

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
 * Отображает форму добавления и редактирования видео.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData={}] - Данные видео для редактирования
 * @param {Function} props.onClose - Закрывает форму
 * @param {Function} props.onSubmit - Отправляет форму
 * @returns {JSX.Element} Форма видео
 */
export const VideoForm = ({ initialData = {}, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  const notify = useNotify();
  const isCancellingRef = useRef(false);

  /**
   * Отправляет видео и закрепляет загруженные файлы.
   *
   * @param {Object} values - Значения формы
   * @returns {Promise<void>}
   */
  const handleSubmit = async (values) => {
    try {
      await onSubmit(values, isEdit, initialData?.id);
    } catch (error) {
      notify.error(
        getApiErrorDisplay(
          error,
          isEdit ? 'Ошибка обновления видео' : 'Ошибка добавления видео'
        )
      );

      throw error;
    }

    // Сохранение на сервере уже завершилось успешно.
    const usedUrls = [values.videoUrl, values.previewUrl, values.thumbnailUrl];

    const results = await Promise.all([
      videoUpload.finalize(usedUrls),
      thumbnailUpload.finalize(usedUrls),
      previewUpload.finalize(usedUrls),
    ]);

    if (!results.every(Boolean)) {
      console.warn('[VideoForm] Не все неиспользуемые временные файлы очищены');
    }

    videoUpload.reset();
    thumbnailUpload.reset();
    previewUpload.reset();

    notify.success(
      isEdit ? 'Видео успешно обновлено' : 'Видео успешно добавлено'
    );

    onClose?.();
  };

  const form = useForm({
    initialValues: {
      title: initialData?.title ?? null,
      description: initialData?.description ?? null,
      duration: initialData?.duration ?? null,
      size: initialData?.size ?? null,
      videoUrl: initialData?.videoUrl ?? null,
      previewUrl: initialData?.previewUrl ?? null,
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
      category: initialData?.category ?? null,
      isPublic: initialData?.isPublic ?? true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      description: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
      videoUrl: [
        required('Загрузите видео'),
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      previewUrl: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      thumbnailUrl: [
        minLength(1, 'Минимально 1 символ'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      category: [required('Выберите категорию')],
    }),
    onSubmit: handleSubmit,
  });

  const videoUpload = useFileUpload(VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('videoUrl', data.videoUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);
      form.setValue('duration', data.duration);
      form.setValue('size', data.size);

      // Предыдущие обложка и предварительный просмотр больше не нужны после замены видео.
      void Promise.all([
        thumbnailUpload.cleanupUploadedFile(),
        previewUpload.cleanupUploadedFile(),
      ]).then((results) => {
        if (!results.every(Boolean)) {
          console.warn('[VideoForm] Не удалось очистить часть старых медиа');
        }
      });

      thumbnailUpload.reset();
      previewUpload.reset();
    },
  });

  const thumbnailUpload = useFileUpload(VIDEO_THUMBNAIL_CONFIG, {
    onSuccess: (data) => {
      form.setValue('thumbnailUrl', data.thumbnailUrl);
    },
  });

  const previewUpload = useFileUpload(VIDEO_PREVIEW_CONFIG, {
    onSuccess: (data) => {
      form.setValue('previewUrl', data.previewUrl);
    },
  });

  const isUploading =
    videoUpload.isUploading ||
    thumbnailUpload.isUploading ||
    previewUpload.isUploading;

  const handleCancel = async () => {
    if (isCancellingRef.current || form.isSubmitting) return;

    isCancellingRef.current = true;

    try {
      // Сбрасывает загрузку до очистки, чтобы ответ не попал в закрытую форму.
      videoUpload.reset();
      thumbnailUpload.reset();
      previewUpload.reset();

      const results = await Promise.all([
        videoUpload.cleanupUploadedFile(),
        thumbnailUpload.cleanupUploadedFile(),
        previewUpload.cleanupUploadedFile(),
      ]);

      if (!results.every(Boolean)) {
        console.warn('[VideoForm] Часть временных файлов будет очищена позже');
      }
    } finally {
      form.reset();
      onClose?.();
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
          menuPlacement="up"
          disabled={form.isSubmitting || isUploading}
          helperText={form.errors.category}
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
