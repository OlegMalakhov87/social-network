import { CommentsSection } from '../../comments-list';
import styles from './CommentableGrid.module.css';


/**
 * Компонент для отображения сетки с комментариями.
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Array} props.items - Массив элементов.
 * @param {Object} props.commentTarget - Объект цели комментария.
 * @returns {JSX.Element} Компонент сетки с комментариями.
 */
export const CommentableGrid = ({ items, commentTarget }) => {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      {commentTarget && (
        <CommentsSection
          targetType={commentTarget.type}
          targetId={commentTarget.id}
        />
      )}
    </div>
  );
};
