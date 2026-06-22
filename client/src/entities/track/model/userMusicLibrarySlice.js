import { createSlice } from '@reduxjs/toolkit';

const userMusicLibrarySlice = createSlice({
  name: 'userMusicLibrary',
  initialState: {
    userMusicLibraryData: [
      {
        userId: 2,
        trackId: 1,
        isFavorite: false,
        playCount: 32,
      },
      {
        userId: 8,
        trackId: 5,
        isFavorite: false,
        playCount: 22,
      },
      {
        userId: 4,
        trackId: 3,
        isFavorite: false,
        playCount: 43,
      },
      {
        userId: 6,
        trackId: 3,
        isFavorite: false,
        playCount: 12,
      },
      {
        userId: 5,
        trackId: 2,
        isFavorite: false,
        playCount: 54,
      },
      {
        userId: 11,
        trackId: 7,
        isFavorite: false,
        playCount: 41,
      },
      {
        userId: 8,
        trackId: 6,
        isFavorite: false,
        playCount: 44,
      },
      {
        userId: 9,
        trackId: 1,
        isFavorite: false,
        playCount: 72,
      },
      {
        userId: 7,
        trackId: 8,
        isFavorite: false,
        playCount: 62,
      },
      {
        userId: 10,
        trackId: 4,
        isFavorite: false,
        playCount: 82,
      },
      {
        userId: 9,
        trackId: 10,
        isFavorite: false,
        playCount: 92,
      },
      {
        userId: 5,
        trackId: 5,
        isFavorite: false,
        playCount: 11,
      },
      {
        userId: 10,
        trackId: 9,
        isFavorite: false,
        playCount: 46,
      },
      {
        userId: 6,
        trackId: 6,
        isFavorite: false,
        playCount: 88,
      },
      {
        userId: 8,
        trackId: 9,
        isFavorite: false,
        playCount: 44,
      },
      {
        userId: 3,
        trackId: 6,
        isFavorite: false,
        playCount: 78,
      },
      {
        userId: 4,
        trackId: 9,
        isFavorite: false,
        playCount: 8,
      },
      {
        userId: 1,
        trackId: 8,
        isFavorite: false,
        playCount: 98,
      },
      {
        userId: 1,
        trackId: 7,
        isFavorite: false,
        playCount: 108,
      },
      {
        userId: 9,
        trackId: 5,
        isFavorite: false,
        playCount: 118,
      },
      {
        userId: 2,
        trackId: 10,
        isFavorite: false,
        playCount: 8,
      },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addMusicToLibrary: (state, action) => {
      const { currentUserId, trackId } = action.payload;
      const existingTrack = state.userMusicLibraryData.find(
        (t) => t.userId === currentUserId && t.trackId === trackId
      );
      const newId =
        state.userMusicLibraryData.length > 0
          ? Math.max(...state.userMusicLibraryData.map((t) => t.id)) + 1
          : 1;
      if (!existingTrack) {
        const newTrack = {
          id: newId,
          userId: currentUserId,
          trackId: trackId,
          isFavorite: false,
          playCount: 0,
          date: new Date().toISOString(),
        };
        state.userMusicLibraryData.push(newTrack);
      }
    },
    removeMusicFromLibrary: (state, action) => {
      const { currentUserId, trackId } = action.payload;
      const myTrackIndex = state.userMusicLibraryData.findIndex(
        (t) => t.userId === currentUserId && t.trackId === trackId
      );
      if (myTrackIndex !== -1) {
        state.userMusicLibraryData.splice(myTrackIndex, 1);
      }
    },
  },
});

export const { addMusicToLibrary, removeMusicFromLibrary } = userMusicLibrarySlice.actions;
export default userMusicLibrarySlice.reducer;
