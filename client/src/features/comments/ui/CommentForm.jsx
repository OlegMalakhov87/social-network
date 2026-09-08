import { useForm, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay, maxLength, required } from '../../../shared/lib';
import { Button, Input } from '../../../shared/ui';

/**
 * Компонент формы для добавления комментария
 * @param {Object} props
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const CommentForm = ({ onSubmit }) => {
  const notify = useNotify();

  /** Форма для добавления комментария с валидацией */
  const form = useForm({
    initialValues: { text: null, isEdited: false },
    rules: () => ({
      text: [
        required('Напишите комментарий'),
        maxLength(2000, 'Максимум 2000 символов'),
      ],
    }),
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        form.reset();
      } catch (error) {
        notify.error(
          getApiErrorDisplay(error, 'Ошибка добавления комментария')
        );
        throw error;
      }
    },
  });

  return (
    <form onSubmit={form.submit}>
      <Input
        multiline={true}
        {...form.register('text')}
        placeholder="Что вы думаете по этому поводу?"
        rows={1}
        rightIcon={
          <Button
            type="submit"
            size="md"
            variant="ghost"
            disabled={form.isSubmitting}
            loading={form.isSubmitting}
          >
            ▶
          </Button>
        }
        disabled={form.isSubmitting}
      />
    </form>
  );
};
