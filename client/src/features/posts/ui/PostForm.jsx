import { POST_TYPES, VISIBILITY_OPTIONS } from '../../../entities/post';
import {
  maxLength,
  minLength,
  required,
  url,
  useAppForm,
} from '../../../features/form';
import {
  BaseCard,
  Button,
  ButtonGroup,
  Input,
  SegmentedControl,
  Select,
  TextArea,
} from '../../../shared/ui';

/**
 * Форма создания/редактирования поста.
 * @param {Object} props
 * @param {Object|null} props.initialData - данные поста для редактирования
 * @param {Function} props.onClose - закрыть форму
 * @param {Function} props.onSubmit - отправить форму
 */
export const PostForm = ({ initialData, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData?.id);
  /** Форма для создания/редактирования поста с валидацией*/
  const form = useAppForm({
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
      mediaUrl: values.type !== 'text' ? [required('Вставьте ссылку'), url()] : [],
    }),
    onSubmit: (values) => {
      onSubmit?.(values, isEdit, initialData?.id);
      onClose?.();
    },
  });

  const type = form.register('type');

  return (
    <BaseCard
      content={
        <form onSubmit={form.submit}>
          {/* Выбор типа поста */}
          <SegmentedControl
            options={POST_TYPES}
            {...type}
            onChange={(value) => {
              type.onChange(value);
              form.setValue('mediaUrl', '');
            }}
          />

          {/* Поле ввода сообщения */}
          <TextArea
            {...form.register('message')}
            placeholder="Поделитесь своими новостями"
            rows={3}
          />

          {/* Динамическое поле для URL */}
          {form.values.type !== 'text' && (
            <Input
              type="url"
              {...form.register('mediaUrl')}
              placeholder={
                form.values.type === 'image'
                  ? 'Ссылка на изображение...'
                  : 'Ссылка на видео...'
              }
            />
          )}
          <Select
            {...form.register('visibility')}
            options={VISIBILITY_OPTIONS}
          />

          {/* Кнопки действий */}
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
            <Button type="submit">{isEdit ? 'Сохранить изменения' : 'Опубликовать'}</Button>
          </ButtonGroup>
        </form>
      }
    />
  );
};
