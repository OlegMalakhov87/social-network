import { useForm, useNotify } from '../../../shared/hooks';
import {
  getApiErrorDisplay,
  maxLength,
  minLength,
  required,
} from '../../../shared/lib';
import { IconButton, Input } from '../../../shared/ui';

/**
 * Компонент формы для добавления комментария
 * @param {Object} props
 * @param {Function} props.onSubmit - функция для отправки формы
 */
export const CommentForm = ({ onSubmit }) => {
  const notify = useNotify();

  /** Форма для добавления комментария с валидацией */
  const form = useForm({
    initialValues: { text: null },
    rules: (values) => ({
      text: [
        required('Напишите комментарий'),
        minLength(1, 'Минимально 1 символ'),
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
        disabled={form.isSubmitting}
        rightIcon={
          <IconButton
            icon="➤"
            size="lg"
            variant="ghost"
            type="submit"
            disabled={form.isSubmitting}
            ariaLabel="Отправить комментарий"
          />
        }
      />
    </form>
  );
};
