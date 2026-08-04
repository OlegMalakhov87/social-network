import { useForm } from '../../../shared/hooks';
import { maxLength, minLength } from '../../../shared/lib';
import { IconButton, TextArea } from '../../../shared/ui';
import { handleKeyboardClick } from '../../../shared/utils';
import style from './MessageForm.module.css';

/**
 * Форма для добавления сообщения
 * @param {Object} props - пропсы компонента
 * @param {Object} props.partnerId - ID партнера
 * @param {Function} props.sendMessage - функция для отправки сообщения
 * @returns {React.ReactNode} - компонент MessageForm
 */
export const MessageForm = ({ partnerId, onSubmit }) => {
  /** Форма для добавления комментария с валидацией */
  const form = useForm({
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

  /** Функция для обработки нажатия клавиши Enter или Space.*/
  const handleKeyDown = (event) => {
    handleKeyboardClick(event, form.submit);
  };

  return (
    <form onSubmit={form.submit} className={style.messageFormWrapper}>
      <TextArea
        {...form.register('message')}
        placeholder="Написать сообщение..."
        rows={1}
        disabled={form.isSubmitting}
        onKeyDown={handleKeyDown}
        className={style.chatTextarea}
      />

      <IconButton
        icon="➤"
        variant="primary"
        size="md"
        type="submit"
        disabled={!form.values.message?.trim() || form.isSubmitting}
        ariaLabel="Отправить сообщение"
      />
    </form>
  );
};
