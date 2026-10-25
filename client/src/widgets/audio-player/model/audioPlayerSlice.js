import { createSlice } from '@reduxjs/toolkit';

/**
 * Хранит начальное состояние аудиоплеера.
 * Поле repeat принимает значения off, one и all.
 *
 * @type {Object}
 */
const initialState = {
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  repeat: 'off',
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
 * Сбрасывает позицию и признак воспроизведения.
 *
 * @param {Object} state - Состояние плеера
 */
const resetPlaybackState = (state) => {
  state.isPlaying = false;
  state.currentTime = 0;
  state.duration = 0;
  state.progress = 0;
  state.isLoading = false;
};

/**
 * Управляет очередью, воспроизведением, громкостью и повтором.
 */
const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    /**
     * Записывает очередь и выбирает текущий трек.
     *
     * @param {Object} state - Состояние плеера
     * @param {Object} action - Действие Redux с очередью и индексом
     */
    setQueue: (state, action) => {
      const { queue, currentIndex } = action.payload;
      state.queue = queue;
      state.currentIndex = currentIndex ?? (queue.length ? 0 : -1);
      state.currentTrack =
        state.currentIndex !== -1 ? state.queue[state.currentIndex] : null;
      resetPlaybackState(state);
      state.error = null;
    },
    /**
     * Переключает воспроизведение на следующий трек.
     *
     * @param {Object} state - Состояние плеера
     */
    nextTrack: (state) => {
      if (!state.queue.length) return;
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') nextIndex = 0;
        else nextIndex = -1;
      }
      if (state.shuffle && state.queue.length > 1 && nextIndex !== -1) {
        // Выбирает другой индекс, чтобы не повторять текущий трек.
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * state.queue.length);
        } while (randomIndex === state.currentIndex && state.queue.length > 1);
        nextIndex = randomIndex;
      }
      if (nextIndex === -1) {
        state.currentTrack = null;
        state.currentIndex = -1;
        resetPlaybackState(state);
        return;
      }
      state.currentIndex = nextIndex;
      state.currentTrack = state.queue[nextIndex];
      state.currentTime = 0;
      state.duration = 0;
      state.progress = 0;
      state.error = null;
    },

    /**
     * Переключает воспроизведение на предыдущий трек.
     *
     * @param {Object} state - Состояние плеера
     */
    prevTrack: (state) => {
      if (!state.queue.length) return;
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeat === 'all') prevIndex = state.queue.length - 1;
        else prevIndex = 0;
      }
      state.currentIndex = prevIndex;
      state.currentTrack = state.queue[prevIndex];
      state.currentTime = 0;
      state.duration = 0;
      state.progress = 0;
      state.error = null;
    },

    /**
     * Записывает режим повтора.
     *
     * @param {Object} state - Состояние плеера
     * @param {Object} action - Действие Redux с режимом повтора
     */
    setRepeat: (state, action) => {
      state.repeat = action.payload;
    },

    /**
     * Переключает перемешивание очереди.
     *
     * @param {Object} state - Состояние плеера
     */
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    /**
     * Очищает очередь и текущий трек.
     *
     * @param {Object} state - Состояние плеера
     */
    clearPlayer: (state) => {
      state.currentTrack = null;
      state.queue = [];
      state.currentIndex = -1;
      resetPlaybackState(state);
      state.error = null;
    },

    /**
     * Записывает состояние воспроизведения из медиаэлемента.
     *
     * @param {Object} state - Состояние плеера
     * @param {Object} action - Действие Redux с полями воспроизведения
     */
    updatePlayerState: (state, action) => {
      const {
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        progress,
        isLoading,
        error,
      } = action.payload;
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

/**
 * Содержит действия управления аудиоплеером.
 *
 * @type {Object}
 */
export const {
  setQueue,
  nextTrack,
  prevTrack,
  setRepeat,
  toggleShuffle,
  clearPlayer,
  updatePlayerState,
} = audioPlayerSlice.actions;

/**
 * Обновляет состояние аудиоплеера в Redux.
 *
 * @param {Object} state - Состояние плеера
 * @param {Object} action - Действие Redux
 * @returns {Object} Следующее состояние.
 */
export default audioPlayerSlice.reducer;
