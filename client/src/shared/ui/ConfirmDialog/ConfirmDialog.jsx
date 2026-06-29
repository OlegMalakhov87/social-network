import { Modal } from '../Modal';
import { Button } from '../Button';
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
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {string} [props.title='Подтверждение']
 * @param {string} [props.description]
 * @param {string} [props.confirmText='Подтвердить']
 * @param {string} [props.cancelText='Отмена']
 * @param {'danger'|'primary'} [props.confirmVariant='danger']
 * @param {boolean} [props.loading=false]
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
