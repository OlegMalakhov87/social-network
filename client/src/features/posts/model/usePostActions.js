import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { addLike, deleteLike } from '../../../app/providers/slices/likesSlice';
import {
  addPost,
  deletePost,
  updateNewPostText,
  updateVisibilityPost,
} from '../../../entities/post';

/**
 * Хук для действий с постами
 * @returns {Object}
 * @property {Function} handleLike - Поставить лайк посту
 * @property {Function}handleUnlike - Удалить лайк с поста
 * @property {Function}handleDeletePost - Удалить пост
 * @property {Function}handleAddPost - Добавить пост
 * @property {Function} handleUpdateVisibilityPost - Изменить приватность для постов через настройки
 * @property {Function}handleUpdateNewPostText - Изменить текст поста
 * @property {string}newPostText - Текст поста
 */

export const usePostActions = () => {
  const dispatch = useDispatch();
  const newPostText = useSelector((state) => state.posts?.newPostText || '');
  const currentUser = useSelector((state) => state.auth?.user);

  const handleLike = useCallback(
    (postId) => () => {
      if (!currentUser?.id || !postId) return;
      dispatch(
        addLike({
          currentUserId: currentUser.id,
          targetId: postId,
          targetType: 'Post',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleUnlike = useCallback(
    (postId) => () => {
      if (!currentUser?.id || !postId) return;
      dispatch(
        deleteLike({
          currentUserId: currentUser.id,
          targetId: postId,
          targetType: 'Post',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleDeletePost = useCallback(
    (postId) => () => {
      if (!currentUser?.id || !postId) return;
      dispatch(deletePost({ postId, currentUserId: currentUser.id }));
    },
    [dispatch, currentUser?.id]
  );

  const handleAddPost = useCallback(
    () => () => {
      if (!currentUser?.id) return;
      dispatch(addPost({ newPostText, currentUserId: currentUser.id }));
    },
    [dispatch, currentUser?.id, newPostText]
  );

  const handleUpdateVisibilityPost = useCallback(
    (post) => () => {
      if (!currentUser?.id) return;
      dispatch(
        updateVisibilityPost({
          postId: post.id,
          currentUserId: currentUser.id,
          visibility: post.visibility,
        })
      );
    },
    [dispatch, currentUser.id]
  );

  const handleUpdateNewPostText = (newPostText, e) => {
    e?.stopPropagation?.();
    dispatch(updateNewPostText(newPostText));
  };
  return {
    handleLike,
    handleUnlike,
    handleDeletePost,
    handleAddPost,
    handleUpdateVisibilityPost,
    handleUpdateNewPostText,
    newPostText,
  };
};
