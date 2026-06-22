import { createSlice } from '@reduxjs/toolkit';

const userVideosLibrarySlice = createSlice({
  name: 'userVideosLibrary',
  initialState: {
    userVideosLibraryData: [
      {
        userId: 2,
        videoId: 1,
        isFavorite: false,
        watchCount: 32,
        lastWatchedAt: '2026-01-01',
      },
      {
        id: 2,
        userId: 8,
        videoId: 5,
        isFavorite: false,
        watchCount: 22,
        lastWatchedAt: '2026-02-01',
      },
      {
        userId: 4,
        videoId: 3,
        isFavorite: false,
        watchCount: 43,
        lastWatchedAt: '2026-02-23',
      },
      {
        userId: 6,
        videoId: 3,
        isFavorite: false,
        watchCount: 12,
        lastWatchedAt: '2026-02-02',
      },
      {
        userId: 5,
        videoId: 2,
        isFavorite: false,
        watchCount: 54,
        lastWatchedAt: '2026-01-13',
      },
      {
        userId: 11,
        videoId: 7,
        isFavorite: false,
        watchCount: 41,
        lastWatchedAt: '2025-12-20',
      },
      {
        userId: 8,
        videoId: 6,
        isFavorite: false,
        watchCount: 44,
        lastWatchedAt: '2026-02-03',
      },
      {
        userId: 9,
        videoId: 1,
        isFavorite: false,
        watchCount: 72,
        lastWatchedAt: '2026-02-17',
      },
      {
        userId: 7,
        videoId: 8,
        isFavorite: false,
        watchCount: 62,
        lastWatchedAt: '2026-02-23',
      },
      {
        userId: 10,
        videoId: 4,
        isFavorite: false,
        watchCount: 82,
        lastWatchedAt: '2026-02-03',
      },
      {
        userId: 9,
        videoId: 10,
        isFavorite: false,
        watchCount: 92,
        lastWatchedAt: '2026-02-22',
      },
      {
        userId: 5,
        videoId: 5,
        isFavorite: false,
        watchCount: 11,
        lastWatchedAt: '2026-02-11',
      },
      {
        userId: 10,
        videoId: 9,
        isFavorite: false,
        watchCount: 46,
        lastWatchedAt: '2026-02-09',
      },
      {
        userId: 6,
        videoId: 6,
        isFavorite: false,
        watchCount: 88,
        lastWatchedAt: '2026-02-08',
      },
      {
        userId: 8,
        videoId: 9,
        isFavorite: false,
        watchCount: 44,
        lastWatchedAt: '2026-01-03',
      },
      {
        userId: 3,
        videoId: 6,
        isFavorite: false,
        watchCount: 78,
        lastWatchedAt: '2026-02-18',
      },
      {
        userId: 4,
        videoId: 2,
        isFavorite: false,
        watchCount: 8,
        lastWatchedAt: '2026-01-18',
      },
      {
        userId: 1,
        videoId: 8,
        isFavorite: false,
        watchCount: 98,
        lastWatchedAt: '2026-02-28',
      },
      {
        userId: 1,
        videoId: 7,
        isFavorite: false,
        watchCount: 108,
        lastWatchedAt: '2026-02-19',
      },
      {
        userId: 9,
        videoId: 5,
        isFavorite: false,
        watchCount: 118,
        lastWatchedAt: '2026-02-15',
      },
      {
        userId: 2,
        videoId: 10,
        isFavorite: false,
        watchCount: 8,
        lastWatchedAt: '2026-02-08',
      },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addVideoToLibrary: (state, action) => {
      const { currentUserId, videoId } = action.payload;
      const existingVideo = state.userVideosLibraryData.find(
        (v) => v.userId === currentUserId && v.videoId === videoId
      );
      const newId =
        state.userVideosLibraryData.length > 0
          ? Math.max(...state.userVideosLibraryData.map((v) => v.id)) + 1
          : 1;
      if (!existingVideo) {
        const newVideo = {
          id: newId,
          userId: currentUserId,
          videoId: videoId,
          isFavorite: false,
          watchCount: 0,
          lastWatchedAt: '',
          date: new Date().toISOString(),
        };
        state.userVideosLibraryData.push(newVideo);
      }
    },
    removeVideoFromLibrary: (state, action) => {
      const { currentUserId, videoId } = action.payload;
      const myVideoIndex = state.userVideosLibraryData.findIndex(
        (v) => v.userId === currentUserId && v.videoId === videoId
      );
      if (myVideoIndex !== -1) {
        state.userVideosLibraryData.splice(myVideoIndex, 1);
      }
    },
  },
});

export const { addVideoToLibrary, removeVideoFromLibrary } = userVideosLibrarySlice.actions;
export default userVideosLibrarySlice.reducer;
