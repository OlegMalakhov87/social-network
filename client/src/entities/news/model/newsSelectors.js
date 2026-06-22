import { createSelector } from '@reduxjs/toolkit';

const selectLikesData = (state) => state.likes?.likesData || [];

export const makeSelectNewsData = () =>
  createSelector(
    [selectLikesData, (_, news) => news, (_, __, currentUserId) => Number(currentUserId)],
    (likesData, news, currentUserIdNum) =>
      news.map((news) => ({
        news,
        likesCount: likesData.filter(
          (like) => like.targetType === 'News' && like.targetId === news.id
        ).length,

        isLiked: likesData.some(
          (like) =>
            like.targetType === 'News' &&
            like.targetId === news.id &&
            like.userId === currentUserIdNum
        ),
      }))
  );
