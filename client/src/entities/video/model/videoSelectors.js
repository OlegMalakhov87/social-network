import { createSelector } from '@reduxjs/toolkit';

const selectLikesData = (state) => state.likes?.likesData || [];
const selectLibraryData = (state) => state.userVideosLibrary?.userVideosLibraryData || [];

export const makeSelectVideoData = () =>
  createSelector(
    [
      selectLikesData,
      selectLibraryData,
      (_, videos) => videos,
      (_, __, currentUserId) => currentUserId,
    ],
    (likesData, libraryData, videos, currentUserId) =>
      videos.map((video) => ({
        video,
        likesCount: likesData.filter(
          (like) => like.targetType === 'Video' && like.targetId === video.id
        ).length,

        isLiked: likesData.some(
          (like) =>
            like.targetType === 'Video' &&
            like.targetId === video.id &&
            like.userId === currentUserId
        ),

        isInLibrary: libraryData.some(
          (item) => item.videoId === video.id && item.userId === currentUserId
        ),
      }))
  );
