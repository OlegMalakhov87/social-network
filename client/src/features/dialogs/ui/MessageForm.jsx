import { useForm, useNotify } from '../../../shared/hooks';
import {
  getApiErrorDisplay,
  maxLength,
  minLength,
  required,
} from '../../../shared/lib';
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
export const MessageForm = ({ partnerId, onSubmit, currentUser }) => {
  const notify = useNotify();

  /** Форма для добавления комментария с валидацией */
  const form = useForm({
    initialValues: { content: null, author: currentUser },
    rules: (values) => ({
      content: [
        required('Напишите сообщение'),
        minLength(1, 'Минимум 1 символ'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
    }),
    onSubmit: async (values) => {
      try {
        await onSubmit?.(partnerId, values);
        form.reset();
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка отправки сообщения'));
        throw error;
      }
    },
  });

  /** Функция для обработки нажатия клавиши Enter или Space.*/
  const handleKeyDown = (event) => {
    handleKeyboardClick(event, form.submit);
  };

  return (
    <form onSubmit={form.submit} className={style.messageFormWrapper}>
      <TextArea
        {...form.register('content')}
        placeholder="Написать сообщение..."
        rows={1}
        disabled={form.isSubmitting}
        onKeyDown={handleKeyDown}
        className={style.chatTextarea}
      />

      <IconButton
        icon="➤"
        size="lg"
        variant="ghost"
        type="submit"
        disabled={form.isSubmitting}
        ariaLabel="Отправить сообщение"
      />
    </form>
  );
};
