import { GENRE_OPTIONS } from '../../../entities/track';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Input,
  Modal,
  Select,
  TextArea,
} from '../../../shared/ui';
import { maxLength, minLength, required, url, useAppForm } from '../../form';
/**
 * Форма добавления/редактирования трека с валидацией.
 *
 * @param {Object} initialData - данные трека для редактирования
 * @param {Function} onClose - функция для закрытия формы
 * @param {Function} onSubmit - функция для отправки формы
 */
export const TrackForm = (initialData, onClose, onSubmit) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для создания/редактирования трека с валидацией*/
  const form = useAppForm({
    initialValues: {
      title: initialData?.title || '',
      artist: initialData?.artist || '',
      album: initialData?.album || '',
      year: initialData?.year || '',
      fileUrl: initialData?.fileUrl || '',
      genre: initialData?.genre || '',
      description: initialData?.description || '',
      isPublic: initialData?.isPublic || true,
    },
    rules: () => ({
      title: [
        required('Введите название'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      artist: [
        required('Введите исполнителя'),
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      album: [
        minLength(10, 'Минимально 10 символов'),
        maxLength(100, 'Максимум 100 символов'),
      ],
      year: [required('Введите год'), minLength(4, 'Минимально 4 символов')],
      genre: [required('Выберите жанр')],
      description: [
        minLength(10, 'Минимально 10 символов'),
        maxLength(500, 'Максимум 500 символов'),
      ],
      fileUrl: [required('Введите ссылку на файл'), url()],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? '✏️ Редактировать трек' : '📰 Добавить трек'}
      size="md"
    >
      <form onSubmit={form.submit}>
        <Input
          label="Название *"
          {...form.register('title')}
          placeholder="Название трека"
          disabled={form.isSubmitting}
        />
        <Input
          label="Исполнитель *"
          {...form.register('artist')}
          placeholder="Имя исполнителя или группы"
          disabled={form.isSubmitting}
        />
        <Input
          label="Альбом"
          {...form.register('album')}
          placeholder="Название альбома (необязательно)"
          disabled={form.isSubmitting}
        />

        <Select
          label="Жанр"
          {...form.register('genre')}
          options={GENRE_OPTIONS}
          disabled={form.isSubmitting}
        />

        <Input
          label="Ссылка на файл *"
          type="url"
          {...form.register('fileUrl')}
          placeholder="Вставьте ссылку"
          disabled={form.isSubmitting}
        />

        <TextArea
          label="Описание"
          {...form.register('description')}
          placeholder="Введите описание трека"
          rows={3}
          disabled={form.isSubmitting}
        />

        <Checkbox
          id="isPublic"
          name="isPublic"
          label="Публичный трек (виден всем)"
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
              onClose?.();
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
