import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { News } from '../../../entities/news';
import { normalizeSharedNews } from '../../../entities/shared-entity';
import { useShareEntity } from '../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import { EntityWithComments } from '../../entity-comments';
import styles from './NewsList.module.css';

/** Список новостей
 *
 * @param {Object} props
 * @param {Array} props.news - массив новостей
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleComments - функция для открытия/закрытия панели комментариев
 * @param {Object} props.commentTarget - целевая сущность для комментирования
 * @param {Function} props.onCloseComments - функция для закрытия панели комментариев
 * @param {Function} props.onCommentChange - функция для изменения комментариев
 * @param {Function} props.toggleLike - функция для лайка/дизлайка новости
 * @param {boolean} props.isLoading - флаг загрузки новостей
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей страницы новостей
 * @param {Error} props.error - ошибка загрузки новостей
 * @param {Function} props.onVideoStart - функция для установки функции начала воспроизведения видео
 * @param {Function} props.onPlayNews - функция для открытия новости
 * @param {Object} props.currentNews - текущая новость
 * @param {boolean} props.isPlaying - флаг воспроизведения видео
 * @param {boolean} props.hasMore - флаг наличия следующей страницы новостей
 * @param {Function} props.loadMore - функция для загрузки следующей страницы новостей
 * @param {Function} props.onRetry - функция для перезагрузки новостей
 * @param {Function} props.updateViewsCount - функция для обновления количества просмотров новости
 * @param {Function} props.deleteNews - функция для удаления новости
 * @param {Function} props.updateNews - функция для обновления новости
 */

export const NewsList = ({
  news = [],
  currentUser,
  toggleComments,
  commentTarget,
  onCloseComments,
  onCommentChange,
  toggleLike,
  isLoading,
  isLoadingMore,
  error,
  onVideoStart,
  onPlayNews,
  currentNews,
  isPlaying,
  hasMore,
  loadMore,
  onRetry,
  updateViewsCount,
  deleteNews,
  updateNews,
}) => {
  const newsRef = useRef(news);
  newsRef.current = news;

  const navigate = useNavigate();

  /** Хук для работы с расшаренными сущностями в sessionStorage.*/
  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedNews,
    onSuccess: () => navigate('/messages'),
  });

  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && news.length > 0;

  /** Счётчик просмотров при старте воспроизведения в модальном плеере */
  useEffect(() => {
    if (typeof onVideoStart !== 'function') return;

    onVideoStart((video) => {
      if (!video?.id) return;

      const currentVideo = newsRef.current.find((item) => item.id === video.id);

      updateViewsCount?.(currentVideo?.id);
    });

    return () => onVideoStart(null);
  }, [onVideoStart, updateViewsCount]);

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={isLoading && news.length === 0}
        error={news.length === 0 ? error : null}
        isEmpty={!news?.length}
        loadingMessage="Загружаем новости..."
        emptyIcon="📰"
        emptyTitle="Новости не найдены"
        emptyDescription="Попробуйте изменить параметры поиска или выберите другую категорию"
        onRetry={onRetry}
      >
        <div className={styles.newsList}>
          {news.map((news) => (
            <EntityWithComments
              key={news.id}
              entity={news}
              targetType="news"
              isOpen={commentTarget?.id === news.id}
              onClose={onCloseComments}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
              renderEntity={(entity) => (
                <News
                  news={entity}
                  currentUser={currentUser}
                  onShareEntity={shareEntity}
                  toggleLike={toggleLike}
                  onReadMore={updateViewsCount}
                  toggleComments={toggleComments}
                  onDelete={deleteNews}
                  onUpdate={updateNews}
                  onPlay={onPlayNews}
                  currentNews={currentNews}
                  isPlaying={isPlaying}
                />
              )}
            />
          ))}

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
