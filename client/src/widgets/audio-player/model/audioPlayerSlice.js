import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  repeat: 'off', // 'off' | 'one' | 'all'
  shuffle: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isMuted: false,
  progress: 0,
  isLoading: false,
  error: null,
};

/**
 * Слайс аудиоплеера. Управляет состоянием воспроизведения, очередью,
 * громкостью, повтором и перемешиванием.
 * @name audioPlayerSlice
 */

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    setQueue: (state, action) => {
      const { queue, currentIndex } = action.payload;
      state.queue = queue;
      state.currentIndex = currentIndex ?? (queue.length ? 0 : -1);
      state.currentTrack = state.currentIndex !== -1 ? state.queue[state.currentIndex] : null;
      state.error = null;
    },
    nextTrack: (state) => {
      if (!state.queue.length) return;
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') nextIndex = 0;
        else nextIndex = -1;
      }
      if (state.shuffle && state.queue.length > 1 && nextIndex !== -1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * state.queue.length);
        } while (randomIndex === state.currentIndex && state.queue.length > 1);
        nextIndex = randomIndex;
      }
      if (nextIndex === -1) {
        state.currentTrack = null;
        state.currentIndex = -1;
        state.isPlaying = false;
        return;
      }
      state.currentIndex = nextIndex;
      state.currentTrack = state.queue[nextIndex];
      state.error = null;
    },
    prevTrack: (state) => {
      if (!state.queue.length) return;
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeat === 'all') prevIndex = state.queue.length - 1;
        else prevIndex = 0;
      }
      state.currentIndex = prevIndex;
      state.currentTrack = state.queue[prevIndex];
      state.error = null;
    },
    setRepeat: (state, action) => {
      state.repeat = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    clearPlayer: (state) => {
      state.currentTrack = null;
      state.queue = [];
      state.currentIndex = -1;
      state.isPlaying = false;
      state.isLoading = false;
      state.error = null;
    },
    // Синхронизация с DOM-событиями
    updatePlayerState: (state, action) => {
      const { isPlaying, currentTime, duration, volume, isMuted, progress, isLoading, error } =
        action.payload;
      if (isPlaying !== undefined) state.isPlaying = isPlaying;
      if (currentTime !== undefined) state.currentTime = currentTime;
      if (duration !== undefined) state.duration = duration;
      if (volume !== undefined) state.volume = volume;
      if (isMuted !== undefined) state.isMuted = isMuted;
      if (progress !== undefined) state.progress = progress;
      if (isLoading !== undefined) state.isLoading = isLoading;
      if (error !== undefined) state.error = error;
    },
  },
});

export const {
  setQueue,
  nextTrack,
  prevTrack,
  setRepeat,
  toggleShuffle,
  clearPlayer,
  updatePlayerState,
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;
