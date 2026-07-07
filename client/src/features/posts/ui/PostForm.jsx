import { POST_TYPES, VISIBILITY_OPTIONS } from '../../../entities/post';
import { required, url, useAppForm } from '../../../features/form';
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
 * @param {boolean} props.isLoading – флаг загрузки
 * @param {Function} props.onAddPost – колбэк с данными поста
 * @param {Function} props.onClose – закрыть форму
 */
export const PostForm = ({ isLoading, onAddPost, onClose }) => {
  const form = useAppForm({
    initialValues: {
      message: '',
      visibility: 'public',
      postType: 'text',
      mediaUrl: '',
    },
    rules: (values) => ({
      message: [required()],
      mediaUrl: values.postType !== 'text' ? [required(), url()] : [],
    }),
    onSubmit: (values) => {
      onAddPost?.(values);
      onClose?.();
    },
  });

  return (
    <BaseCard
      content={
        <form onSubmit={form.submit}>
          {/* Выбор типа поста */}
          <SegmentedControl
            options={POST_TYPES}
            value={form.values.postType}
            {...form.register('postType')}
          />

          {/* Поле ввода сообщения */}
          <TextArea
            {...form.register('message')}
            disabled={isLoading}
            placeholder="Поделитесь своими новостями"
            rows={3}
          />

          {/* Динамическое поле для URL */}
          {form.values.postType !== 'text' && (
            <Input
              type="url"
              {...form.register('mediaUrl')}
              placeholder={
                form.values.postType === 'image'
                  ? 'Ссылка на изображение...'
                  : 'Ссылка на видео...'
              }
              disabled={isLoading}
            />
          )}
          <Select
            {...form.register('visibility')}
            options={VISIBILITY_OPTIONS}
            disabled={isLoading}
          />

          {/* Кнопки действий */}
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => onClose?.()}
              disabled={isLoading}
            >
              Отмена
            </Button>

            <Button
              type="submit"
              disabled={
                !form.values.message.trim() || !form.isValid || isLoading
              }
            >
              Опубликовать
            </Button>
          </ButtonGroup>
        </form>
      }
    />
  );
};
