import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../../entities/auth';
import { setupAxiosInterceptors } from '../../shared/api';
import { audioPlayerReducer } from '../../widgets/audio-player';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    audioPlayer: audioPlayerReducer,
  },
});

setupAxiosInterceptors(store);
