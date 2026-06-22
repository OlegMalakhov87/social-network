import { createSelector } from '@reduxjs/toolkit';

const selectLikesData = (state) => state.likes?.likesData || [];
const selectLibraryData = (state) => state.userMusicLibrary?.userMusicLibraryData || [];

export const makeSelectTrackData = () =>
  createSelector(
    [
      selectLikesData,
      selectLibraryData,
      (_, tracks) => tracks,
      (_, __, currentUserId) => currentUserId,
    ],
    (likesData, libraryData, tracks, currentUserId) =>
      tracks.map((track) => ({
        track,
        likesCount: likesData.filter(
          (like) => like.targetType === 'Music' && like.targetId === track.id
        ).length,

        isLiked: likesData.some(
          (like) =>
            like.targetType === 'Music' &&
            like.targetId === track.id &&
            like.userId === currentUserId
        ),

        isInLibrary: libraryData.some(
          (item) => item.trackId === track.id && item.userId === currentUserId
        ),
      }))
  );
