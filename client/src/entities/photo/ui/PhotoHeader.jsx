import style from './PhotoHeader.module.css';
import { Button } from '../../../shared/ui';

/**
 * Шапка карточки фото.
 *
 * @param {Object} props
 * @param {Object} props.photo
 * @param {boolean} props.isOwn
 * @param {Function} props.onDelete
 */

export const PhotoHeader = ({ photo, isOwn, onDelete }) => {
  <header className={style.header}>
    {isOwn && (
      <Button variant="danger" size="sm" onClick={() => onDelete(photo.id)}>
        Удалить
      </Button>
    )}
  </header>;
};
