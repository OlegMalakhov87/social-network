import { createSlice } from '@reduxjs/toolkit';

const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    videosData: [
      {
        uploadedBy: 1,
        title: 'Big Buck Bunny',
        description: 'Короткометражный анимационный фильм',
        duration: 596,
        size: 104857600,
        year: 2008,
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=7',
        category: 'Movie',
        isPublic: true,
        viewCount: 2425,
      },
      {
        uploadedBy: 3,
        title: 'Elephant Dream',
        description: 'Первый открытый фильм Blender Foundation',
        duration: 600,
        size: 157286400,
        year: 2006,
        videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=12',
        category: 'Movie',
        isPublic: true,
        viewCount: 1870,
      },
      {
        uploadedBy: 7,
        title: 'For Bigger Blazes',
        description: 'Рекламный ролик H.264',
        duration: 15,
        size: 2684354,
        year: 2016,
        videoUrl: 'http://vjs.zencdn.net/v/oceans.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=25',
        category: 'Openings',
        isPublic: true,
        viewCount: 540,
      },
      {
        uploadedBy: 5,
        title: 'For Bigger Joyrides',
        description: 'Ещё один демо-ролик',
        duration: 15,
        size: 3678901,
        year: 2016,
        videoUrl: 'https://samplelib.com/mp4/sample-10s.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=31',
        category: 'Openings',
        isPublic: false,
        viewCount: 325,
      },
      {
        uploadedBy: 9,
        title: 'Subaru Outback On Street And Dirt',
        description: 'Обзор Subaru Outback',
        duration: 180,
        size: 12345678,
        year: 2016,
        videoUrl:
          'https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_1MB.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=42',
        category: 'Travel',
        isPublic: true,
        viewCount: 1285,
      },
      {
        uploadedBy: 2,
        title: 'Tears of Steel',
        description: 'Короткометражный фильм Blender Foundation',
        duration: 734,
        size: 25678901,
        year: 2012,
        videoUrl:
          'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=53',
        category: 'Movie',
        isPublic: true,
        viewCount: 2150,
      },
      {
        uploadedBy: 11,
        title: 'Sintel',
        description: 'Короткометражный фильм Blender Foundation',
        duration: 888,
        size: 31457280,
        year: 2010,
        videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/av1/1080/Sintel_1080_10s_1MB.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=67',
        category: 'Movie',
        isPublic: true,
        viewCount: 870,
      },
      {
        uploadedBy: 4,
        title: 'We Are Going On Bullrun',
        description: 'Экстремальное вождение',
        duration: 164,
        size: 9876543,
        year: 2016,
        videoUrl: 'https://pixabay.com/videos/beach-sea-nature-ocean-sand-348116/',
        thumbnailUrl: 'https://picsum.photos/320/180?random=78',
        category: 'Sports',
        isPublic: true,
        viewCount: 645,
      },
      {
        uploadedBy: 6,
        title: 'What is WebM?',
        description: 'Объяснение формата WebM',
        duration: 48,
        size: 567890,
        year: 2026,
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatIsWebM.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=89',
        category: 'Openings',
        isPublic: false,
        viewCount: 340,
      },
      {
        uploadedBy: 8,
        title: 'Бег по горам',
        description: 'Трейлраннинг в Альпах',
        duration: 420,
        size: 29360128,
        year: 2026,
        videoUrl: 'https://storage.example.com/videos/trail-running.mp4',
        thumbnailUrl: 'https://picsum.photos/320/180?random=94',
        category: 'Sports',
        isPublic: false,
        viewCount: 1980,
      },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addVideo: (state, action) => {
      const { currentUserId, formData } = action.payload;
      const newVideo = {
        id: state.videosData.length + 1,
        uploadedBy: currentUserId,
        title: formData.title,
        description: formData.description,
        duration: 360,
        size: 1234567,
        year: new Date().getFullYear(),
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl,
        category: formData.category,
        isPublic: formData.isPublic,
        viewCount: 0,
        date: new Date().toISOString(),
      };
      state.videosData.push(newVideo);
    },

    deleteVideo: (state, action) => {
      const { currentUser, videoId } = action.payload;
      const video = state.videosData.find((v) => v.id === videoId);
      if ((video && video.uploadedBy === currentUser.id) || currentUser.isAdmin) {
        state.videosData = state.videosData.filter((v) => v.id !== videoId);
      }
    },
  },
});

export const { addVideo, deleteVideo } = videosSlice.actions;

export default videosSlice.reducer;
