import { useState } from 'react';
import { POST_TYPES } from '../../../entities/post';
import { useForm, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay, maxLength, required } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  ButtonGroup,
  Checkbox,
  FileInput,
  SegmentedControl,
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
      notify.success(
        isEdit ? 'Пост успешно обновлен' : 'Пост успешно добавлен'
      );
      onClose?.();
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка сохранения поста'));
      throw error;
    }
  };
  /** Форма для создания/редактирования поста с валидацией*/
  const form = useForm({
    initialValues: {
      text: initialData?.text ?? null,
      isPublic: initialData?.isPublic ?? true,
      type: initialData?.type ?? 'text',
      postUrl: initialData?.postUrl ?? null,
      previewUrl: initialData?.previewUrl ?? null,
      thumbnailUrl: initialData?.thumbnailUrl ?? null,
      pinned: initialData?.pinned ?? false,
      isEdited: initialData?.isEdited ?? false,
    },
    rules: (values) => ({
      text:
        values.type === 'text'
          ? [
              required('Введите текст'),
              maxLength(5000, 'Максимум 5000 символов'),
            ]
          : [],
      postUrl: values.type !== 'text' ? [required('Загрузите медиафайл')] : [],
    }),
    onSubmit: handleSubmit,
  });

  /** Хук для загрузки изображения */
  const imageUpload = useFileUpload(POST_IMAGE_UPLOAD_CONFIG, {
    onSuccess: (data) => form.setValue('postUrl', data.postUrl),
  });

  /** Хук для загрузки видео */
  const videoUpload = useFileUpload(POST_VIDEO_UPLOAD_CONFIG, {
    onSuccess: (data) => {
      form.setValue('postUrl', data.postUrl);
      form.setValue('previewUrl', data.previewUrl);
      form.setValue('thumbnailUrl', data.thumbnailUrl);
    },
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
      form.setValue('text', null);
      form.setValue('postUrl', null);
      form.setValue('previewUrl', null);
      form.setValue('thumbnailUrl', null);
  
      imageUpload.reset();
      videoUpload.reset();
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
    <BaseCard
      content={
        <form onSubmit={form.submit}>
          {/* Выбор типа поста */}
          <SegmentedControl
            options={POST_TYPES}
            disabled={form.isSubmitting || isUploading || isChangingType}
            {...form.register('type')}
            onChange={handleTypeChange}
          />

          {/* Поле ввода сообщения */}
          <TextArea
            {...form.register('text')}
            placeholder="Поделитесь своими новостями"
            rows={3}
            disabled={form.isSubmitting || isUploading || isChangingType}
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
              error={activeUpload.error || form.errors.postUrl}
              onChange={activeUpload.handleFileChange}
              disabled={form.isSubmitting || isUploading}
            />
          )}

          {/* Выбор видимости */}
          <Checkbox
            id="isPublic "
            name="isPublic"
            label="Хотите чтобы ваш пост увидели"
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
      }
    />
  );
};
