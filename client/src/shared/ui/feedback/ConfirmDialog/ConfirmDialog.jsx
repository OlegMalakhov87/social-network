import { Button, Modal } from '../../../ui';
import styles from './ConfirmDialog.module.css';

/**
 * Диалог подтверждения действия.
 *
 * Используется для удаления,
 * выхода из аккаунта,
 * отмены изменений,
 * очистки данных и других опасных действий.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - открыт ли диалог
 * @param {Function} props.onClose - функция закрытия диалога
 * @param {Function} props.onConfirm - функция подтверждения действия
 * @param {string} [props.title='Подтверждение'] - заголовок диалога
 * @param {string} [props.description] - описание действия
 * @param {string} [props.confirmText='Подтвердить'] - текст кнопки подтверждения
 * @param {string} [props.cancelText='Отмена'] - текст кнопки отмены
 * @param {'danger'|'primary'} [props.confirmVariant='danger'] - вариант кнопки подтверждения
 * @param {boolean} [props.loading=false] - загружается ли действие
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  description = '',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className={styles.content}>{description}</div>
    </Modal>
  );
};
