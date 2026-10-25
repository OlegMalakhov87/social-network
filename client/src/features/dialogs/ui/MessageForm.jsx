import { useForm, useNotify } from '../../../shared/hooks';
import {
  getApiErrorDisplay,
  maxLength,
  minLength,
  required,
} from '../../../shared/lib';
import { IconButton, TextArea } from '../../../shared/ui';

import style from './MessageForm.module.css';

/**
 * Отображает форму отправки сообщения.
 *
 * @param {Object} props - Свойства компонента
 * @param {number} props.partnerId - Идентификатор собеседника
 * @param {Function} props.onSubmit - Отправляет сообщение
 * @returns {JSX.Element} Форма сообщения
 */
export const MessageForm = ({ partnerId, onSubmit }) => {
  const notify = useNotify();

  const form = useForm({
    initialValues: { content: '' },
    rules: (values) => ({
      content: [
        required('Напишите сообщение'),
        minLength(1, 'Минимум 1 символ'),
        maxLength(1000, 'Максимум 1000 символов'),
      ],
    }),
    onSubmit: async (values) => {
      try {
        const content = values.content?.trim();
        if (!content) return;
        const sent = await onSubmit(partnerId, content);
        if (sent === false) {
          return;
        }
        form.reset();
      } catch (error) {
        notify.error(getApiErrorDisplay(error, 'Ошибка отправки сообщения'));
        throw error;
      }
    },
  });

  /**
   * Отправляет форму по клавише Enter или пробелу.
   *
   * @param {KeyboardEvent} event - Событие клавиатуры
   * @returns {void}
   */
  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (!form.isSubmitting) {
        form.submit(event);
      }
    }
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
