import { Button, Modal } from '../..';

import styles from './ConfirmDialog.module.css';

/**
 * Запрашивает подтверждение действия.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Признак открытого окна
 * @param {Function} props.onClose - Обработчик закрытия
 * @param {Function} props.onConfirm - Обработчик подтверждения
 * @param {string} [props.title='Подтверждение'] - Заголовок окна
 * @param {string} [props.description=''] - Описание действия
 * @param {string} [props.confirmText='Подтвердить'] - Текст кнопки подтверждения
 * @param {string} [props.cancelText='Отмена'] - Текст кнопки отмены
 * @param {'danger'|'primary'} [props.confirmVariant='danger'] - Вариант кнопки подтверждения
 * @param {boolean} [props.loading=false] - Признак выполнения действия
 * @returns {JSX.Element} Окно подтверждения.
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
      mobileFullscreen={false}
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
