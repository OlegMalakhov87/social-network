import { createSlice } from '@reduxjs/toolkit';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    commentsData: [
      {
        userId: 8,
        targetType: 'Post',
        targetId: 14,
        content: 'Это интересно!',
      },
      {
        userId: 6,
        targetType: 'Post',
        targetId: 9,
        content: 'Это интересно!',
      },
      {
        userId: 9,
        targetType: 'Post',
        targetId: 5,
        content: 'Это интересно!',
      },
      {
        userId: 2,
        targetType: 'Post',
        targetId: 11,
        content: 'Это интересно!',
      },
      {
        userId: 4,
        targetType: 'Post',
        targetId: 6,
        content: 'Это интересно!',
      },
      {
        userId: 4,
        targetType: 'Post',
        targetId: 23,
        content: 'Это интересно!',
      },
      {
        userId: 11,
        targetType: 'Post',
        targetId: 9,
        content: 'Это интересно!',
      },
      {
        userId: 1,
        targetType: 'Post',
        targetId: 7,
        content: 'Это интересно!',
      },
      {
        userId: 7,
        targetType: 'Post',
        targetId: 16,
        content: 'Это интересно!',
      },
      {
        userId: 7,
        targetType: 'Post',
        targetId: 6,
        content: 'Это интересно!',
      },
      {
        userId: 3,
        targetType: 'News',
        targetId: 17,
        content: 'Это интересно!',
      },
      {
        userId: 11,
        targetType: 'News',
        targetId: 1,
        content: 'Это интересно!',
      },
      {
        userId: 10,
        targetType: 'News',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 9,
        targetType: 'News',
        targetId: 8,
        content: 'Это интересно!',
      },
      {
        userId: 4,
        targetType: 'News',
        targetId: 5,
        content: 'Это интересно!',
      },
      {
        userId: 5,
        targetType: 'News',
        targetId: 7,
        content: 'Это интересно!',
      },
      {
        userId: 1,
        targetType: 'Video',
        targetId: 1,
        content: 'Это интересно!',
      },
      {
        userId: 2,
        targetType: 'Video',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 7,
        targetType: 'Video',
        targetId: 3,
        content: 'Это интересно!',
      },
      {
        userId: 8,
        targetType: 'Video',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 8,
        targetType: 'Music',
        targetId: 1,
        content: 'Это интересно!',
      },
      {
        userId: 7,
        targetType: 'Music',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 4,
        targetType: 'Music',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 2,
        targetType: 'Music',
        targetId: 3,
        content: 'Это интересно!',
      },
      {
        userId: 6,
        targetType: 'Music',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 3,
        targetType: 'Music',
        targetId: 2,
        content: 'Это интересно!',
      },
      {
        userId: 9,
        targetType: 'Music',
        targetId: 4,
        content: 'Это интересно!',
      },
      {
        userId: 9,
        targetType: 'Post',
        targetId: 7,
        content: 'Это интересно!',
      },
    ],
    newCommentText: '',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addComment: (state, action) => {
      const { content, userId, targetType, targetId } = action.payload;
      if (!content.trim()) return;
      const newId =
        state.commentsData.length > 0 ? Math.max(...state.commentsData.map((c) => c.id)) + 1 : 1;
      const newComment = {
        id: newId,
        userId,
        targetId,
        targetType,
        content,
        date: new Date().toISOString(),
      };
      state.commentsData.unshift(newComment);
      state.newCommentText = '';
    },

    editComment: (state, action) => {
      const { id, newText, currentUser } = action.payload;
      const comment = state.commentsData.find((c) => c.id === id);
      if (comment && comment.userId === currentUser.id) {
        comment.content = newText.trim();
        comment.edited = true;
      }
    },

    deleteComment: (state, action) => {
      const { commentId, currentUser } = action.payload;
      const comment = state.commentsData.find((comment) => comment.id === commentId);
      if (comment && (comment.userId === currentUser.id || currentUser.isAdmin)) {
        state.commentsData = state.commentsData.filter((comment) => comment.id !== commentId);
      }
    },

    updateNewCommentText: (state, action) => {
      state.newCommentText = action.payload;
    },
  },
});
export const { addComment, updateNewCommentText, editComment, deleteComment } =
  commentsSlice.actions;
export default commentsSlice.reducer;
