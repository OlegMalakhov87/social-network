import { IconButton, TextArea } from '../../../shared/ui';
import { maxLength, minLength, useAppForm } from '../../form';

/**
 * Форма для добавления сообщения
 * @param {Object} props - пропсы компонента
 * @param {Object} props.partnerId - ID партнера
 * @param {Function} props.sendMessage - функция для отправки сообщения
 * @returns {React.ReactNode} - компонент MessageForm
 */
export const MessageForm = ({ partnerId, onSubmit }) => {
  /** Форма для добавления комментария с валидацией */
  const form = useAppForm({
    initialValues: { message: '' },
    rules: () => ({
      message: [
        minLength(1, 'Напишите сообщение'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
    }),
    onSubmit: (values) => {
      onSubmit?.(partnerId, values.message);
    },
  });

  return (
    <form onSubmit={form.submit}>
      <TextArea
        {...form.register('message')}
        placeholder="Написать сообщение..."
        rows={3}
        disabled={form.isSubmitting}
      />

      <IconButton
        icon="➤"
        variant="primary"
        size="md"
        type="submit"
        disabled={!form.values.message?.trim() || form.isSubmitting}
      />
    </form>
  );
};
