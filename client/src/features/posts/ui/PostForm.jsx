import { useRef, useState } from 'react';

import { POST_TYPES } from '../../../entities/post';
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
  Modal,
  SegmentedControl,
  TextArea,
} from '../../../shared/ui';
import {
  POST_IMAGE_UPLOAD_CONFIG,
  POST_VIDEO_UPLOAD_CONFIG,
  useFileUpload,
} from '../../file-upload';

/**
 * Отображает форму добавления и редактирования поста.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData={}] - Данные поста для редактирования
 * @param {Function} props.onClose - Закрывает форму
 * @param {Function} props.onSubmit - Отправляет форму
 * @param {Object} props.currentUser - Текущий пользователь
 * @returns {JSX.Element} Форма поста
 */
export const PostForm = ({
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
   * Отправляет пост и закрепляет загруженные файлы.
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
          isEdit ? 'Ошибка обновления поста' : 'Ошибка добавления поста'
        )
      );
      throw error;
    }

    // Сохранение на сервере уже завершилось успешно.
    const usedUrls = [values.postUrl, values.previewUrl, values.thumbnailUrl];

    const results = await Promise.all([
      imageUpload.finalize(usedUrls),
      videoUpload.finalize(usedUrls),
    ]);

    if (!results.every(Boolean)) {
      console.warn('[PostForm] Не все неиспользуемые временные файлы очищены');
    }

    imageUpload.reset();
    videoUpload.reset();

    notify.success(isEdit ? 'Пост успешно обновлен' : 'Пост успешно добавлен');
    onClose?.();
  };

  const form = useForm({
    initialValues: {
      userId: currentUser?.id,
      text: initialData?.text ?? null,
      type: initialData?.type ?? 'text',
      postUrl: initialData?.postUrl ?? null,
      previewUrl: initialData?.previewUrl ?? null,
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
      isPublic: initialData?.isPublic ?? true,
      pinned: initialData?.pinned ?? false,
      author: currentUser,
    },
    /**
     * Возвращает правила полей по типу поста.
     *
     * @param {Object} values - Значения формы
     * @param {string} values.type - Тип поста
     * @returns {Object} Правила полей
     */
    rules: (values) => ({
      text:
        values.type === 'text'
          ? [
              required('Введите текст'),
              minLength(1, 'Минимально 1 символ'),
              maxLength(2000, 'Максимум 2000 символов'),
            ]
          : [],
      postUrl:
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

  const imageUpload = useFileUpload(POST_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('postUrl', data.postUrl);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);
    },
  });

  const videoUpload = useFileUpload(POST_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('postUrl', data.postUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);

      void imageUpload.cleanupUploadedFile().then((isCleaned) => {
        if (!isCleaned) {
          console.warn('[PostForm] Не удалось очистить часть старых медиа');
        }
      });

      imageUpload.reset();
    },
  });

  const isUploading = imageUpload.isUploading || videoUpload.isUploading;

  const activeUpload = form.values.type === 'video' ? videoUpload : imageUpload;

  const activeConfig =
    form.values.type === 'video'
      ? POST_VIDEO_UPLOAD_CONFIG
      : POST_IMAGE_UPLOAD_CONFIG;

  /**
   * Меняет тип поста и удаляет временный файл предыдущего типа.
   *
   * @param {string} value - Новый тип поста
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
      form.setValue('postUrl', null);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);

      if (currentUpload) {
        currentUpload.reset();

        const isCleaned = await currentUpload.cleanupUploadedFile();

        if (!isCleaned) {
          console.warn('[PostForm] Часть временных файлов будет очищена позже');
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
          '[PostForm] Не все неиспользуемые временные файлы очищены'
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
      title={isEdit ? '✏️ Редактировать пост' : '🎬 Добавить пост'}
      size="md"
    >
      <form onSubmit={form.submit}>
        <SegmentedControl
          options={POST_TYPES}
          disabled={form.isSubmitting || isUploading || isChangingType}
          {...form.register('type')}
          onChange={handleTypeChange}
        />

        <TextArea
          {...form.register('text')}
          placeholder="Поделитесь своими новостями"
          rows={3}
          disabled={form.isSubmitting || isUploading || isChangingType}
        />

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
            error={activeUpload.error || form.errors.postUrl}
            onChange={activeUpload.handleFileChange}
            disabled={form.isSubmitting || isUploading || isChangingType}
            required={true}
          />
        )}

        <Checkbox
          id="isPublic "
          name="isPublic"
          label="Ваш пост увидят"
          description={
            form.values.isPublic
              ? 'Все пользователи'
              : 'Только вы и ваши друзья'
          }
          align="end"
          checked={form.values.isPublic}
          onChange={(e) => form.setValue('isPublic', e.target.checked)}
          disabled={form.isSubmitting || isUploading || isChangingType}
        />

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
