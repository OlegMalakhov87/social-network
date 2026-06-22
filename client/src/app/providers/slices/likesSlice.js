import { createSlice } from '@reduxjs/toolkit';

/**
 * Слайс лайков. Хранит все лайки всех типов (Post, Comment, Music, Video, News).
 */
const likesSlice = createSlice({
  name: 'likes',
  initialState: {
    likesData: [
      { userId: 11, targetType: 'Post', targetId: 12 },
      { userId: 3, targetType: 'Post', targetId: 5 },
      { userId: 4, targetType: 'Post', targetId: 6 },
      { userId: 9, targetType: 'Post', targetId: 7 },
      { userId: 8, targetType: 'Post', targetId: 2 },
      { userId: 3, targetType: 'News', targetId: 2 },
      { userId: 9, targetType: 'News', targetId: 3 },
      { userId: 11, targetType: 'News', targetId: 4 },
      { userId: 12, targetType: 'Music', targetId: 11 },
      { userId: 5, targetType: 'Post', targetId: 4 },
      { userId: 4, targetType: 'Post', targetId: 6 },
      { userId: 8, targetType: 'Post', targetId: 4 },
      { userId: 9, targetType: 'Post', targetId: 2 },
      { userId: 1, targetType: 'Video', targetId: 7 },
      { userId: 1, targetType: 'Video', targetId: 4 },
      { userId: 9, targetType: 'Video', targetId: 3 },
      { userId: 3, targetType: 'Video', targetId: 5 },
      { userId: 2, targetType: 'Video', targetId: 4 },
      { userId: 12, targetType: 'Music', targetId: 6 },
      { userId: 7, targetType: 'Music', targetId: 1 },
      { userId: 7, targetType: 'Music', targetId: 1 },
      { userId: 8, targetType: 'Comment', targetId: 2 },
      { userId: 9, targetType: 'Comment', targetId: 3 },
      { userId: 3, targetType: 'Comment', targetId: 4 },
      { userId: 4, targetType: 'Comment', targetId: 5 },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    /**
     * Добавить лайк, если его ещё нет.
     * @param {Object} payload
     * @param {number} payload.currentUserId
     * @param {number} payload.targetId
     * @param {string} payload.targetType
     */
    addLike: (state, action) => {
      const { currentUserId, targetId, targetType } = action.payload;
      const existingLike = state.likesData.find(
        (l) => l.userId === currentUserId && l.targetId === targetId && l.targetType === targetType
      );
      if (!existingLike) {
        const newId =
          state.likesData.length > 0 ? Math.max(...state.likesData.map((l) => l.id)) + 1 : 1;
        state.likesData.push({
          id: newId,
          userId: currentUserId,
          targetType,
          targetId,
          date: new Date().toISOString(),
        });
      }
    },

    /**
     * Удалить лайк, если существует.
     */
    deleteLike: (state, action) => {
      const { currentUserId, targetId, targetType } = action.payload;
      const likeIndex = state.likesData.findIndex(
        (l) => l.userId === currentUserId && l.targetId === targetId && l.targetType === targetType
      );
      if (likeIndex !== -1) {
        state.likesData.splice(likeIndex, 1);
      }
    },
  },
});

export const { addLike, deleteLike } = likesSlice.actions;
export default likesSlice.reducer;
