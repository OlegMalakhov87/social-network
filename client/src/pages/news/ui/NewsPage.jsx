import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import style from './NewsPage.module.css';
import { CommentsSection } from '../../../widgets/comments-list';
import { NewsForm, useNews } from '../../../features/news';
import { useCommentsPanel } from '../../../features/comments';
import { NewsCard } from '../../../entities/news';
import {
  EmptyState,
  FilterButton,
  SortDropdown,
  Pagination,
  Loading,
  SearchInput,
} from '../../../shared/ui';
import { usePagination } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Страница новостей – отображает каталог новостей с фильтрацией, поиском и сортировкой.
 */

export const NewsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortKey, setSortKey] = useState('dateDesc');
  const [showNewsForm, setShowNewsForm] = useState(false);

  const currentUser = useSelector((state) => state.auth?.user);

  const {
    news,
    paginationNews,
    isLoadingNews,
    errorNews,
    toggleLikeNews,
    incrementViewCount,
    updateCommentCount,
  } = useNews({
    filter,
    searchQuery,
    sortKey,
  });

  const pagination = usePagination(news, 12, 1);
  const items = pagination.paginatedItems;

  const { commentTarget, handleCloseComments, onToggleComments } = useCommentsPanel(
    'News',
    filter,
    pagination.currentPage
  );

  const handleCommentChange = useCallback(
    (delta) => {
      updateCommentCount(commentTarget.id, delta);
    },
    [commentTarget?.id, updateCommentCount]
  );

  const CATEGORIES = [
    { id: 'All', name: 'Все' },
    { id: 'Technology', name: 'Технологии' },
    { id: 'Sports', name: 'Спорт' },
    { id: 'Culture', name: 'Культура' },
    { id: 'Economy', name: 'Политика' },
    { id: 'Health', name: 'Здоровье' },
  ];

  /**  Состояние загрузки всей страницы */
  if (isLoadingNews && news.length === 0) {
    return <Loading fullPage message="Загружаем новости..." size="large" />;
  }

  return (
    <div className={style.news}>
      {/* Шапка с поиском и фильтрами */}
      <div className={style.header}>
        <h1 className={style.title}>Новости</h1>
        <div className={style.search}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск новостей ..."
          />
        </div>
        <div className={style.filters}>
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat.id}
              cat={cat}
              filter={filter}
              onChangeButtonFilter={(id) => {
                setFilter(id);
                setSearchQuery('');
                setSortKey('dateDesc');
              }}
            />
          ))}
          {currentUser && (
            <button
              className={style.addButton}
              onClick={(e) => {
                e?.stopPropagation();
                setShowNewsForm((prev) => !prev);
              }}
              aria-label="Добавить новость"
            >
              ➕
            </button>
          )}
        </div>
        <SortDropdown options={SORT_OPTIONS} currentSort={sortKey} onChange={setSortKey} />
      </div>
      {/* Сетка новостей */}
      {news.length > 0 ? (
        <>
          <div className={style.newsGrid}>
            {items.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                currentUser={currentUser}
                onToggleLike={toggleLikeNews}
                onReadMore={incrementViewCount}
                toggleComments={onToggleComments}
                error={errorNews}
              />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              totalPages={pagination.totalPages}
              page={pagination.currentPage}
              onPageChange={pagination.goToPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon="📰"
          title="Новости не найдены"
          description="Попробуйте изменить параметры поиска или выберите другую категорию"
        />
      )}

      {showNewsForm && currentUser && (
        <NewsForm
          onClose={(e) => {
            e?.stopPropagation();
            setShowNewsForm(false);
          }}
        />
      )}

      {commentTarget && (
        <CommentsSection
          targetType={commentTarget?.type}
          targetId={commentTarget?.id}
          currentUser={currentUser}
          updateCommentCount={handleCommentChange}
          closeComments={handleCloseComments}
        />
      )}
    </div>
  );
};
