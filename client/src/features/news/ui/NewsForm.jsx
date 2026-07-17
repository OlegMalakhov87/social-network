import { CATEGORY_OPTIONS, NEWS_TYPES } from '../../../entities/news';
import {
  maxLength,
  minLength,
  required,
  url,
  useAppForm,
} from '../../../features/form';
import {
  Button,
  ButtonGroup,
  Input,
  Modal,
  Select,
  TextArea,
} from '../../../shared/ui';

/**
 * Форма добавления/редактирования новости
 *
 * @param {Object} props
 * @param {Object|null} props.initialData - данные новости для редактирования
 * @param {Object} props.userName - имя текущего пользователя
 * @param {Function} props.onClose - закрыть форму
 * @param {Function} props.onSubmit - отправить форму
 */
export const NewsForm = ({ initialData, userName, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для создания/редактирования новости с валидацией*/
  const form = useAppForm({
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
      mediaUrl:
        values.type !== 'text' ? [required('Вставьте ссылку'), url()] : [],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

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
          disabled={form.isSubmitting}
        />

        <TextArea
          label="Текст новости *"
          {...form.register('content')}
          placeholder="Введите текст новости"
          rows={3}
          disabled={form.isSubmitting}
        />

        <Select
          label="Категория *"
          {...form.register('category')}
          options={CATEGORY_OPTIONS}
          disabled={form.isSubmitting}
        />

        <Input
          label="Источник"
          {...form.register('source')}
          placeholder="Название издания"
          disabled={form.isSubmitting}
        />

        <Select
          label="Тип новости *"
          {...form.register('type')}
          options={NEWS_TYPES}
          disabled={form.isSubmitting}
        />

        {form.values.type !== 'text' && (
          <Input
            label="Ссылка на медиа файл"
            type="url"
            {...form.register('mediaUrl')}
            placeholder={
              form.values.type === 'image'
                ? 'Ссылка на изображение...'
                : 'Ссылка на видео...'
            }
            disabled={form.isSubmitting}
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
          >
            Отмена
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting
              ? 'Отправка...'
              : isEdit
                ? 'Сохранить изменения'
                : 'Опубликовать'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};
