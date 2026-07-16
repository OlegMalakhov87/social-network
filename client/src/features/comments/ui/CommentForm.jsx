import {
  BaseCard,
  Button,
  ButtonGroup,
  EntityHeader,
  EntityMeta,
  TextArea,
} from '../../../shared/ui';
import { maxLength, minLength, useAppForm } from '../../form';

/**
 * Форма для добавления комментария
 * @param {Object} props
 * @param {Object} props.currentUser – текущий пользователь
 * @param {Function} props.onSubmit – колбэк на отправку формы
 * @param {Function} props.onClose – колбэк на закрытие формы
 */

export const CommentForm = ({ currentUser, onSubmit, onClose }) => {
  /** Форма для добавления комментария с валидацией */
  const form = useAppForm({
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
          />

          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => {
                form.reset(); 
                onClose?.();
              }}
            >
              Отмена
            </Button>
            <Button type="submit" size="sm">
              Добавить
            </Button>
          </ButtonGroup>
        </form>
      }
    />
  );
};
