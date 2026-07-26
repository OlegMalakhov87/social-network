import { CATEGORY_OPTIONS } from '../../../entities/video';
import { useAppForm } from '../../../shared/hooks';
import { maxLength, minLength, required, url } from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Input,
  Modal,
  Select,
  TextArea,
} from '../../../shared/ui';
/**
 * Форма добавления/редактирования видео.
 * @param {Object} initialData - данные видео для редактирования
 * @param {Function} onClose - функция для закрытия формы
 * @param {Function} onSubmit - функция для отправки формы
 * @returns {JSX.Element} - форма добавления/редактирования видео
 */
export const VideoForm = ({ initialData, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для добавления/редактирования видео с валидацией */
  const form = useAppForm({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      videoUrl: initialData?.videoUrl || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      category: initialData?.category || '',
      isPublic: initialData?.isPublic ?? true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      description: [
        required('Введите описание'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
      videoUrl: [required('Вставьте ссылку'), url()],
      thumbnailUrl: [url()],
      category: [required('Выберите категорию')],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

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
          disabled={form.isSubmitting}
        />

        <TextArea
          label="Описание"
          {...form.register('description')}
          placeholder="Краткое описание видео"
          rows={3}
          disabled={form.isSubmitting}
        />

        <Input
          label="Ссылка на видео *"
          type="url"
          {...form.register('videoUrl')}
          placeholder="Вставьте ссылку на видео"
          disabled={form.isSubmitting}
        />

        <Input
          label="Ссылка на превью (обложку)"
          type="url"
          {...form.register('thumbnailUrl')}
          placeholder="Вставьте ссылку на превью"
          disabled={form.isSubmitting}
        />

        <Select
          label="Категория"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting}
        />

        <Checkbox
          id="isPublic"
          name="isPublic"
          label="Публичное видео (видно всем)"
          checked={form.values.isPublic}
          onChange={(e) => form.setValue('isPublic', e.target.checked)}
          disabled={form.isSubmitting}
        />

        <ButtonGroup>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              form.reset();
              onClose();
            }}
            disabled={form.isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
          >
            {form.isSubmitting
              ? 'Сохранение...'
              : isEdit
                ? 'Сохранить'
                : 'Добавить'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
