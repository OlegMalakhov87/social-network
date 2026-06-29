import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import { audioPlayerReducer } from '../../../widgets/audio-player';
import { setupAxiosInterceptors, setStoreForApiFetch } from '../../../shared/api';
//import likesReducer from '../slices/likesSlice';
//import { postsReducer } from '../../../entities/post';
//import { dialogsReducer } from '../../../entities/dialog';
//import { newsReducer } from '../../../entities/news';
//import { friendsReducer } from '../../../entities/friend';
//import { commentsReducer } from '../../../entities/comment';
//import { usersReducer } from '../../../entities/users';
//import { musicReducer } from '../../../entities/track';
//import { videosReducer } from '../../../entities/video';
//import { userVideosLibraryReducer } from '../../../entities/video';
//import { userMusicLibraryReducer } from '../../../entities/track';

export const store = configureStore({
  reducer: {
    // users: usersReducer,
    // posts: postsReducer,
    // dialogs: dialogsReducer,
    //news: newsReducer,
    //friends: friendsReducer,
    //comments: commentsReducer,
    //likes: likesReducer,
    //music: musicReducer,
    //videos: videosReducer,
    //userVideosLibrary: userVideosLibraryReducer,
    //userMusicLibrary: userMusicLibraryReducer,
    auth: authReducer,
    audioPlayer: audioPlayerReducer,
  },
});

setupAxiosInterceptors(store);
setStoreForApiFetch(store);
