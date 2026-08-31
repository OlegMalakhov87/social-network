import { useForm, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay, maxLength, required } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  TextArea,
} from '../../../shared/ui';

/**
 * Компонент формы для добавления комментария
 * @param {Object} props
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {Function} props.onSubmit - функция для отправки формы
 * @param {Function} props.onClose - функция для закрытия формы
 */
export const CommentForm = ({ currentUser, onSubmit, onClose }) => {
  const notify = useNotify();
  /** Форма для добавления комментария с валидацией */
  const form = useForm({
    initialValues: { text: null, isEdited: false },
    rules: () => ({
      text: [
        required('Введите комментарий'),
        maxLength(2000, 'Максимум 2000 символов'),
      ],
    }),
    onSubmit: async (values) => {
      try {
        if (form.isSubmitting) return;
        await onSubmit?.(values);
      } catch (error) {
        notify.error(
          getApiErrorDisplay(error, 'Ошибка добавления комментария')
        );
        throw error;
      }
    },
  });

  return (
    <BaseCard
      header={
        <EntityHeader>
          <EntityMeta
            avatar={currentUser?.avatarUrl}
            title={currentUser?.name}
            subtitle="Напишите комментарий"
          />
        </EntityHeader>
      }
      content={
        <form onSubmit={form.submit}>
          <TextArea
            {...form.register('text')}
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
              disabled={form.isSubmitting}
              loading={form.isSubmitting}
            >
              Добавить
            </Button>
          </ButtonGroup>
        </form>
      }
    />
  );
};
