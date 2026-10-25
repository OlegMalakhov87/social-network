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
import { EntityWithComments } from '../../comment';

import styles from './NewsList.module.css';

/**
 * Отображает список новостей с подгрузкой при прокрутке.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.news=[]] - Список новостей
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Function} props.toggleComments - Обработчик открытия и закрытия комментариев
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Function} props.onCommentChange - Обработчик изменения комментариев
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {Function} [props.onVideoStart] - Обработчик старта воспроизведения
 * @param {Function} props.onPlayNews - Обработчик открытия новости
 * @param {Object} props.currentNews - Текущая новость
 * @param {boolean} props.isPlaying - Признак воспроизведения
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {Function} [props.updateViewsCount] - Обработчик счётчика просмотров
 * @param {Function} props.deleteNews - Обработчик удаления новости
 * @param {Function} props.updateNews - Обработчик обновления новости
 * @returns {JSX.Element} Разметка списка.
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
  // Оставляет в эффекте актуальный список без повторной подписки на каждый ответ.
  newsRef.current = news;

  const navigate = useNavigate();

  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedNews,
    onSuccess: () => navigate('/messages'),
  });

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  // Показывает наложение, пока список обновляется при уже загруженных новостях.
  const isRefetching = isLoading && news.length > 0;

  useEffect(() => {
    if (typeof onVideoStart !== 'function') return;

    /**
     * Увеличивает счётчик просмотров запущенного ролика.
     *
     * @param {Object} video - Запущенный ролик
     */
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
