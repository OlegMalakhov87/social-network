import { createSelector } from '@reduxjs/toolkit';

const selectLikesData = (state) => state.likes?.likesData || [];

export const makeSelectPostData = () =>
  createSelector(
    [
      selectLikesData,
      (_, posts) => posts,
      (_, __, currentUserId) => currentUserId,
      (_, __, ___, friendshipStatus) => friendshipStatus,
    ],
    (likesData, posts, currentUserId, friendshipStatus) =>
      posts.map((post) => ({
        post,
        likesCount: likesData.filter(
          (like) => like.targetType === 'Post' && like.targetId === post.id
        ).length,
        isLiked: likesData.some(
          (like) =>
            like.targetType === 'Post' && like.targetId === post.id && like.userId === currentUserId
        ),
        isVisible:
          post.visibility === 'private'
            ? false
            : post.visibility === 'friends'
              ? friendshipStatus === 'accepted'
              : true,
      }))
  );
