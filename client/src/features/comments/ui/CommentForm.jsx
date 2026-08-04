import { useForm } from '../../../shared/hooks';
import { maxLength, minLength } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  TextArea,
} from '../../../shared/ui';

/**
 * Форма для добавления комментария
 * @param {Object} props - пропсы компонента
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {Function} props.onSubmit - функция для отправки формы
 * @param {Function} props.onClose - функция для закрытия формы
 * @returns {React.ReactNode} - компонент CommentForm
 */

export const CommentForm = ({ currentUser, onSubmit, onClose }) => {
  /** Форма для добавления комментария с валидацией */
  const form = useForm({
    initialValues: { content: '' },
    rules: () => ({
      content: [
        minLength(1, 'Напишите комментарий'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
    }),
    onSubmit: (values) => {
      onSubmit?.(values.content);
    },
  });

  return (
    <BaseCard
      header={
        <EntityHeader>
          <EntityMeta
            avatar={currentUser?.photoUrl}
            title={currentUser?.name}
            subtitle="Напишите комментарий"
          />
        </EntityHeader>
      }
      content={
        <form onSubmit={form.submit}>
          <TextArea
            {...form.register('content')}
            placeholder="Что вы думаете по этому поводу?"
            rows={3}
            disabled={form.isSubmitting}
          />

          <ButtonGroup>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={form.isSubmitting}
              onClick={() => {
                form.reset();
                onClose?.();
              }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!form.values.content?.trim() || form.isSubmitting}
            >
              {form.isSubmitting ? 'Отправка...' : 'Добавить'}
            </Button>
          </ButtonGroup>
        </form>
      }
    />
  );
};
