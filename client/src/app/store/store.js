import { configureStore } from '@reduxjs/toolkit';
import { setupAxiosInterceptors } from '../../../shared/api';
import { audioPlayerReducer } from '../../../widgets/audio-player';
import { authReducer } from '../../entities/auth';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    audioPlayer: audioPlayerReducer,
  },
});

setupAxiosInterceptors(store);
