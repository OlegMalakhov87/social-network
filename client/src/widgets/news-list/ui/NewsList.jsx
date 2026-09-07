import { News } from '../../../entities/news';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import styles from './NewsList.module.css';

/** Список новостей
 *
 * @param {Object} props
 * @param {Array} props.news - массив новостей
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.hasMore - есть ли еще новости для загрузки
 * @param {boolean} props.isLoading - загружены ли новости
 * @param {string} props.error - ошибка
 * @param {Function} props.toggleLike - функция для лайка новости
 * @param {Function} props.loadMore - функция для загрузки следующей страницы новостей
 * @param {Function} props.onRetry - функция для повторной загрузки новостей
 * @param {Function} props.onReadMore - функция для увеличения количества просмотров новости
 * @param {Function} props.onPlayNews - функция для воспроизведения новости
 * @param {Function} props.toggleComments - функция для открытия комментариев
 * @param {Function} props.deleteNews - функция для удаления новости
 * @param {Function} props.updateNews - функция для обновления новости
 * @param {Object} props.currentNews - текущая новость
 * @param {boolean} props.isPlaying - воспроизводится ли новость
 */

export const NewsList = ({
  news = [],
  currentUser,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  loadMore,
  onRetry,
  toggleLike,
  toggleComments,
  deleteNews,
  updateNews,
  onReadMore,
  onPlayNews,
  currentNews,
  isPlaying,
}) => {
  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && news.length > 0;

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={isLoading && news.length === 0}
        error={error && news.length === 0}
        isEmpty={!news?.length}
        loadingMessage="Загружаем новости..."
        emptyIcon="📰"
        emptyTitle="Новости не найдены"
        emptyDescription="Попробуйте изменить параметры поиска или выберите другую категорию"
        onRetry={onRetry}
      >
        <div className={styles.newsList}>
          {news.map((news) => {
            return (
              <News
                key={news.id}
                news={news}
                currentUser={currentUser}
                toggleLike={toggleLike}
                onReadMore={onReadMore}
                onPlay={onPlayNews}
                currentNews={currentNews}
                isPlaying={isPlaying}
                toggleComments={toggleComments}
                onDelete={deleteNews}
                onUpdate={updateNews}
              />
            );
          })}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {news.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все новости"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
